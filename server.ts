import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  cmsDb,
  verifyPassword,
  createAuthToken,
  verifyAuthToken
} from './src/server/cmsDatabase.ts';
import { BUILD_YOUR_OWN_CONFIG } from './src/data/restaurantData.ts';
import { Order, Reservation } from './src/types/restaurant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High JSON payload limit to support image uploads cleanly
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure uploads directory exists and is served statically
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const publicDir = path.resolve(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// In-memory data stores for orders and reservations
let orders: Order[] = [
  {
    id: 'ord-init-1',
    orderNumber: 'USK-108',
    customerName: 'Robert J.',
    customerPhone: '(509) 445-9821',
    fulfillmentType: 'pickup',
    items: [
      {
        cartItemId: 'c-1',
        menuItemId: 'pizza-sweet-spicy-thai',
        name: 'Sweet & Spicy Thai Chicken Pizza',
        basePrice: 20.00,
        quantity: 1,
        selectedOptions: { 'Crust Style': 'Cheese Stuffed Crust' },
        totalItemPrice: 21.50
      },
      {
        cartItemId: 'c-2',
        menuItemId: 'app-pickle-cigars',
        name: 'Pickle Cigars',
        basePrice: 12.00,
        quantity: 1,
        selectedOptions: { 'Portion Size': 'Full Order (4 Cigars)' },
        totalItemPrice: 12.00
      }
    ],
    subtotal: 33.50,
    tax: 2.71,
    total: 36.21,
    status: 'ready',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    estimatedReadyTime: '15 mins',
    notes: 'Extra garlic honey ranch on the side please'
  }
];

let reservations: Reservation[] = [
  {
    id: 'res-init-1',
    confirmationCode: 'RES-7721',
    customerName: 'Khristopher T.',
    customerPhone: '(509) 555-0192',
    customerEmail: 'khris@example.com',
    date: new Date().toISOString().split('T')[0],
    time: '6:30 PM',
    guests: 4,
    seatingArea: 'family-dining',
    specialRequests: 'High chair needed for child',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: 'res-init-2',
    confirmationCode: 'RES-8842',
    customerName: 'Eric G.',
    customerPhone: '(509) 555-4321',
    customerEmail: 'eric@example.com',
    date: new Date().toISOString().split('T')[0],
    time: '7:45 PM',
    guests: 6,
    seatingArea: 'rec-room',
    specialRequests: 'Near foosball table for friendly tournament',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1800 * 1000).toISOString()
  }
];

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; name: string; role: 'admin' | 'editor' };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const user = verifyAuthToken(token);
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
    return;
  }
  req.user = user;
  next();
}

function requireAdminRole(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied: Requires Admin privileges.' });
      return;
    }
    next();
  });
}

// ----------------------------------------------------
// 1. PUBLIC API ROUTES (Frontend Data Consumption)
// ----------------------------------------------------

// Full CMS payload for live frontend rendering
app.get('/api/cms/content', (_req: Request, res: Response) => {
  const data = cmsDb.getPublicCmsPayload();
  res.json({ success: true, data });
});

// Section dependencies & automatic visibility report
app.get('/api/cms/sections/dependencies', (_req: Request, res: Response) => {
  const data = cmsDb.getSectionDependencies();
  res.json({ success: true, data });
});

// Backwards-compatible info route
app.get('/api/info', (_req: Request, res: Response) => {
  const payload = cmsDb.getPublicCmsPayload();
  res.json({
    success: true,
    data: {
      ...payload.businessInfo,
      hours: {
        status: payload.heroSettings.hoursStatusText,
        regular: payload.openingHours.map(h => ({
          days: h.dayOfWeek,
          time: h.isOpen ? `${h.openTime} – ${h.closeTime}` : 'Closed'
        }))
      }
    }
  });
});

// Backwards-compatible menu route
app.get('/api/menu', (_req: Request, res: Response) => {
  const payload = cmsDb.getPublicCmsPayload();
  res.json({
    success: true,
    data: {
      items: payload.menuItems,
      categories: payload.menuCategories,
      buildYourOwnConfig: BUILD_YOUR_OWN_CONFIG
    }
  });
});

// Reviews / Testimonials route
app.get('/api/reviews', (req: Request, res: Response) => {
  const { tag } = req.query;
  const testimonials = cmsDb.getTestimonials().filter(t => t.isActive && t.isApproved);
  if (tag && typeof tag === 'string' && tag !== 'all') {
    const filtered = testimonials.filter(r => r.tags.includes(tag.toLowerCase()));
    res.json({ success: true, data: filtered });
    return;
  }
  res.json({ success: true, data: testimonials });
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { author, rating, comment, tags } = req.body;
  if (!author || !rating || !comment) {
    res.status(400).json({ success: false, message: 'Author, rating, and review comment are required.' });
    return;
  }

  const newTestimonial = cmsDb.addTestimonial({
    author,
    authorSubtitle: 'Verified Diner · Usk Bar and Grill',
    rating: Number(rating) || 5,
    timeAgo: 'Just now',
    comment,
    tags: Array.isArray(tags) ? tags : ['local bar and grill'],
    likes: 0,
    isApproved: true,
    isActive: true,
    displayOrder: 1
  });

  res.status(201).json({ success: true, data: newTestimonial });
});

// Customer Orders API
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, data: orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  res.json({ success: true, data: order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    fulfillmentType,
    tableNumber,
    vehicleDescription,
    items,
    notes
  } = req.body;

  if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Name, phone number, and at least one item are required.'
    });
    return;
  }

  // Validate phone has only numbers (no alphabets)
  const phoneDigitsOnly = String(customerPhone).replace(/[^0-9]/g, '');
  if (!phoneDigitsOnly || phoneDigitsOnly.length < 7 || phoneDigitsOnly.length > 15) {
    res.status(400).json({
      success: false,
      message: 'Phone number must contain only numbers (between 7 and 15 digits).'
    });
    return;
  }

  // Validate email address
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail).trim())) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
    return;
  }

  const subtotal = items.reduce((sum: number, it: any) => sum + (it.totalItemPrice || it.basePrice * it.quantity), 0);
  const tax = Math.round(subtotal * 0.081 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `USK-${randomNum}`;

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    fulfillmentType: fulfillmentType || 'pickup',
    tableNumber,
    vehicleDescription,
    items,
    subtotal,
    tax,
    total,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    estimatedReadyTime: '20–25 minutes',
    notes
  };

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully! We are heating up the brick oven.',
    data: newOrder
  });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const order = orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }
  const { status } = req.body;
  if (['confirmed', 'prep', 'baking', 'ready', 'completed'].includes(status)) {
    order.status = status;
    res.json({ success: true, data: order });
  } else {
    res.status(400).json({ success: false, message: 'Invalid status' });
  }
});

// Customer Reservations API
app.get('/api/reservations', (_req: Request, res: Response) => {
  res.json({ success: true, data: reservations });
});

app.post('/api/reservations', (req: Request, res: Response) => {
  const { customerName, customerPhone, customerEmail, date, time, guests, seatingArea, specialRequests } = req.body;

  if (!customerName || !customerPhone || !date || !time || !guests) {
    res.status(400).json({
      success: false,
      message: 'Please provide name, phone, date, time, and number of guests.'
    });
    return;
  }

  // Validate phone has only numbers (no alphabets)
  const phoneDigitsOnly = String(customerPhone).replace(/[^0-9]/g, '');
  if (!phoneDigitsOnly || phoneDigitsOnly.length < 7 || phoneDigitsOnly.length > 15) {
    res.status(400).json({
      success: false,
      message: 'Phone number must contain only numbers (between 7 and 15 digits).'
    });
    return;
  }

  // Validate email address if provided
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail).trim())) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
    return;
  }

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const confirmationCode = `RES-${randomCode}`;

  const newReservation: Reservation = {
    id: `res-${Date.now()}`,
    confirmationCode,
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    date,
    time,
    guests: parseInt(guests, 10) || 2,
    seatingArea: seatingArea || 'family-dining',
    specialRequests,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  reservations.unshift(newReservation);

  res.status(201).json({
    success: true,
    message: `Table reserved! Your confirmation code is ${confirmationCode}.`,
    data: newReservation
  });
});

// ----------------------------------------------------
// 2. ADMIN AUTHENTICATION ROUTES
// ----------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }

  const admin = cmsDb.getAdminByEmail(email);
  if (!admin) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const isValid = verifyPassword(password, admin.passwordHash, admin.salt);
  if (!isValid) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  cmsDb.updateLastLogin(admin.id);
  const token = createAuthToken({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt
  });

  res.json({
    success: true,
    message: 'Welcome back to the Admin Dashboard!',
    data: {
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
  });
});

app.get('/api/admin/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

// ----------------------------------------------------
// 3. ADMIN MANAGEMENT ROUTES (Protected)
// ----------------------------------------------------

// Full CMS payload for Admin dashboard (including inactive items)
app.get('/api/admin/cms/content', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const data = cmsDb.getAdminCmsPayload();
  res.json({ success: true, data });
});

// Dashboard Overview metrics
app.get('/api/admin/dashboard/overview', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const metrics = cmsDb.getDashboardOverview();
  res.json({
    success: true,
    data: {
      ...metrics,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status !== 'completed').length,
      totalReservations: reservations.length,
      confirmedReservations: reservations.filter(r => r.status === 'confirmed').length
    }
  });
});

// Image Upload Endpoint: Supports base64 data URLs or binary file payload
app.post('/api/admin/upload', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, message: 'No image data provided.' });
      return;
    }

    // Match data URI pattern: data:image/png;base64,...
    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let extension = 'jpg';
    let base64Data = imageBase64;

    if (matches && matches.length === 3) {
      extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    const buffer = Buffer.from(base64Data, 'base64');
    // Limit to 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'File size exceeds maximum 10MB limit.' });
      return;
    }

    const cleanName = (filename || 'uploaded_image')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueFilename = `${cleanName}_${Date.now()}.${extension}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        url: publicUrl,
        filename: uniqueFilename,
        size: buffer.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Image upload failed.' });
  }
});

// Single Section Update Handlers
app.patch('/api/admin/global-settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = cmsDb.updateGlobalSettings(req.body);
  res.json({ success: true, message: 'Global settings updated.', data: updated });
});

app.patch('/api/admin/hero-settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = cmsDb.updateHeroSettings(req.body);
  res.json({ success: true, message: 'Hero section updated.', data: updated });
});

app.patch('/api/admin/business-info', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = cmsDb.updateBusinessInfo(req.body);
  res.json({ success: true, message: 'Business info updated.', data: updated });
});

app.patch('/api/admin/footer-content', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = cmsDb.updateFooterContent(req.body);
  res.json({ success: true, message: 'Footer content updated.', data: updated });
});

app.patch('/api/admin/seo-settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = cmsDb.updateSeoSettings(req.body);
  res.json({ success: true, message: 'SEO settings updated.', data: updated });
});

// Landing Page Section Toggles & Reorder
app.get('/api/admin/landing-sections', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getLandingSections() });
});

app.patch('/api/admin/landing-sections/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateLandingSection(req.params.id, req.body);
    res.json({ success: true, message: 'Landing section updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/landing-sections/reorder', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ success: false, message: 'orderedIds array required' });
    return;
  }
  const updated = cmsDb.reorderLandingSections(orderedIds);
  res.json({ success: true, message: 'Sections reordered.', data: updated });
});

// Menu Categories CRUD
app.get('/api/admin/categories', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getMenuCategories() });
});

app.post('/api/admin/categories', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const added = cmsDb.addMenuCategory(req.body);
    res.status(201).json({ success: true, message: 'Category added.', data: added });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/categories/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateMenuCategory(req.params.id, req.body);
    res.json({ success: true, message: 'Category updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/categories/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reassignToId } = req.query;
    cmsDb.deleteMenuCategory(req.params.id, typeof reassignToId === 'string' ? reassignToId : undefined);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Menu Items CRUD
app.get('/api/admin/menu-items', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getMenuItems() });
});

app.post('/api/admin/menu-items', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const added = cmsDb.addMenuItem(req.body);
    res.status(201).json({ success: true, message: 'Menu item created.', data: added });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/menu-items/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateMenuItem(req.params.id, req.body);
    res.json({ success: true, message: 'Menu item updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/menu-items/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    cmsDb.deleteMenuItem(req.params.id);
    res.json({ success: true, message: 'Menu item deleted.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Statistics CRUD
app.get('/api/admin/statistics', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getStatistics() });
});

app.post('/api/admin/statistics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addStatistic(req.body);
  res.status(201).json({ success: true, message: 'Statistic added.', data: added });
});

app.patch('/api/admin/statistics/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateStatistic(req.params.id, req.body);
    res.json({ success: true, message: 'Statistic updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/statistics/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  cmsDb.deleteStatistic(req.params.id);
  res.json({ success: true, message: 'Statistic deleted.' });
});

// Locations CRUD
app.get('/api/admin/locations', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getLocations() });
});

app.post('/api/admin/locations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addLocation(req.body);
  res.status(201).json({ success: true, message: 'Location added.', data: added });
});

app.patch('/api/admin/locations/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateLocation(req.params.id, req.body);
    res.json({ success: true, message: 'Location updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/locations/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    cmsDb.deleteLocation(req.params.id);
    res.json({ success: true, message: 'Location deleted.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Opening Hours CRUD
app.get('/api/admin/opening-hours', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getOpeningHours() });
});

app.patch('/api/admin/opening-hours/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateOpeningHour(req.params.id, req.body);
    res.json({ success: true, message: 'Opening hour updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Features CRUD
app.get('/api/admin/features', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getFeatures() });
});

app.post('/api/admin/features', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addFeature(req.body);
  res.status(201).json({ success: true, message: 'Feature added.', data: added });
});

app.patch('/api/admin/features/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateFeature(req.params.id, req.body);
    res.json({ success: true, message: 'Feature updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/features/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  cmsDb.deleteFeature(req.params.id);
  res.json({ success: true, message: 'Feature deleted.' });
});

// Testimonials CRUD
app.get('/api/admin/testimonials', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getTestimonials() });
});

app.post('/api/admin/testimonials', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addTestimonial(req.body);
  res.status(201).json({ success: true, message: 'Testimonial added.', data: added });
});

app.patch('/api/admin/testimonials/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateTestimonial(req.params.id, req.body);
    res.json({ success: true, message: 'Testimonial updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/testimonials/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  cmsDb.deleteTestimonial(req.params.id);
  res.json({ success: true, message: 'Testimonial deleted.' });
});

// Gallery CRUD
app.get('/api/admin/gallery', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getGallery() });
});

app.post('/api/admin/gallery', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addGalleryItem(req.body);
  res.status(201).json({ success: true, message: 'Gallery item added.', data: added });
});

app.patch('/api/admin/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateGalleryItem(req.params.id, req.body);
    res.json({ success: true, message: 'Gallery item updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/gallery/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  cmsDb.deleteGalleryItem(req.params.id);
  res.json({ success: true, message: 'Gallery item deleted.' });
});

// CTA Sections CRUD
app.get('/api/admin/cta-sections', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getCtaSections() });
});

app.patch('/api/admin/cta-sections/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateCtaSection(req.params.id, req.body);
    res.json({ success: true, message: 'CTA section updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Social Links CRUD
app.get('/api/admin/social-links', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getSocialLinks() });
});

app.post('/api/admin/social-links', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addSocialLink(req.body);
  res.status(201).json({ success: true, message: 'Social link added.', data: added });
});

app.patch('/api/admin/social-links/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateSocialLink(req.params.id, req.body);
    res.json({ success: true, message: 'Social link updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/social-links/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  cmsDb.deleteSocialLink(req.params.id);
  res.json({ success: true, message: 'Social link deleted.' });
});

// Navigation Items CRUD
app.get('/api/admin/navigation-items', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getNavigationItems() });
});

app.post('/api/admin/navigation-items', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const added = cmsDb.addNavigationItem(req.body);
  res.status(201).json({ success: true, message: 'Navigation item added.', data: added });
});

app.patch('/api/admin/navigation-items/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateNavigationItem(req.params.id, req.body);
    res.json({ success: true, message: 'Navigation item updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/navigation-items/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  cmsDb.deleteNavigationItem(req.params.id);
  res.json({ success: true, message: 'Navigation item deleted.' });
});

// Admin Users Management (Restricted to 'admin' role)
app.get('/api/admin/users', requireAdminRole, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: cmsDb.getAdmins() });
});

app.post('/api/admin/users', requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
      return;
    }
    const user = cmsDb.createAdmin(name, email, password, role);
    res.status(201).json({ success: true, message: 'Admin user created successfully.', data: user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.patch('/api/admin/users/:id', requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = cmsDb.updateAdmin(req.params.id, req.body);
    res.json({ success: true, message: 'Admin user updated.', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/users/:id', requireAdminRole, (req: AuthenticatedRequest, res: Response) => {
  try {
    cmsDb.deleteAdmin(req.params.id);
    res.json({ success: true, message: 'Admin user deleted.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ----------------------------------------------------
// 4. SERVER & VITE INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Usk Bar and Grill full-stack CMS server running on http://0.0.0.0:${PORT}`);
    console.log(`Admin credentials: admin@uskbarandgrill.com / AdminPassword123!`);
  });
}

startServer();
