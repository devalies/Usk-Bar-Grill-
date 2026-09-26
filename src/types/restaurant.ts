export interface MenuItem {
  id: string;
  name: string;
  category: 'red-base-pizza' | 'chicken-pizza' | 'specialty-pizza' | 'appetizers' | 'wings' | 'drinks';
  description: string;
  price: number;
  image?: string;
  popular?: boolean;
  options?: {
    name: string;
    choices: { label: string; extraPrice: number }[];
  }[];
  tags?: string[];
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedOptions: { [key: string]: string };
  specialInstructions?: string;
  customPizzaDetails?: {
    crust: string;
    sauce: string;
    meats: string[];
    veggies: string[];
    cheeses: string[];
    drizzles: string[];
  };
  totalItemPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  fulfillmentType: 'drive-through' | 'pickup' | 'dine-in';
  tableNumber?: string;
  vehicleDescription?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'confirmed' | 'prep' | 'baking' | 'ready' | 'completed';
  createdAt: string;
  estimatedReadyTime: string;
  notes?: string;
}

export interface Reservation {
  id: string;
  confirmationCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  time: string;
  guests: number;
  seatingArea: 'family-dining' | 'tavern-bar' | 'rec-room';
  specialRequests?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  authorSubtitle: string;
  rating: number;
  timeAgo: string;
  comment: string;
  tags: string[];
  likes?: number;
}
