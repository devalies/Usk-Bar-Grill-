import { MenuItem, Review } from '../types/restaurant';

export const RESTAURANT_INFO = {
  name: 'Usk Bar and Grill',
  tagline: 'Authentic Brick Oven Pizza, Craft Appetizers & Small Town Tavern Hospitality',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.png',
  rating: 4.6,
  reviewsCount: 149,
  priceRange: '$10–20',
  address: '112 5th St, Usk, WA 99180, United States',
  plusCode: '8P79+HP Usk, Washington, USA',
  phone: '+1 509-445-1262',
  phoneFormatted: '(509) 445-1262',
  menuSource: 'facebook.com',
  hours: {
    status: 'Open · Closes 10 PM',
    regular: [
      { days: 'Monday – Thursday', time: '11:00 AM – 9:30 PM' },
      { days: 'Friday – Saturday', time: '11:00 AM – 10:00 PM' },
      { days: 'Sunday', time: '11:00 AM – 9:00 PM' }
    ]
  },
  amenities: [
    'Brick oven fired 12" specialty pizzas',
    'Free foosball & pool table in private back rec room',
    'Darts board & classic tavern games',
    'Drive-through pickup window & Dine-in',
    'Family dining section + full bar/tavern section',
    'Locally famous Havarti pickle cigars & loaded fries'
  ],
  geminiSummary:
    "Diners like this bar and grill's delicious pizza, especially the Thai pizza and Parmesan butter crust, along with their tasty boneless wings. They also highlight the reasonable prices and the friendly, efficient service. Guests mention the homey, relaxed atmosphere and a small rec room with free foosball and pool."
};

export const RESTAURANT_IMAGES = {
  logo: '/logo.png',
  heroExterior: '/src/assets/images/usk_hero_exterior_cozy_1790385571691.jpg',
  brickOvenPizza: '/src/assets/images/usk_pizza_brick_oven_1790385584536.jpg',
  recRoom: '/src/assets/images/usk_rec_room_vibe_1790385596127.jpg',
  appetizersSpread: '/src/assets/images/usk_pickle_cigars_loaded_fries_1790385606595.jpg',
};

export const MENU_ITEMS: MenuItem[] = [
  // Red Base Signature Pizzas
  {
    id: 'pizza-meat-lovers',
    name: 'Meat Lovers Pizza',
    category: 'red-base-pizza',
    description: 'Our house red sauce, mozzarella, pepperoni, sausage crumble, ham, and bacon on a 12" brick oven crust.',
    price: 20.50,
    popular: true,
    image: RESTAURANT_IMAGES.brickOvenPizza,
    tags: ['Customer Favorite', 'Brick Oven'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Add-Ons',
        choices: [
          { label: 'None', extraPrice: 0 },
          { label: "Lamana's Hot Honey Drizzle", extraPrice: 1.50 },
          { label: 'Fresh Basil', extraPrice: 1.50 },
          { label: 'Prosciutto Upgrade', extraPrice: 1.50 },
          { label: 'Twice the Meat', extraPrice: 5.00 }
        ]
      }
    ]
  },
  {
    id: 'pizza-supreme',
    name: 'Supreme Pizza',
    category: 'red-base-pizza',
    description: 'House red sauce, mozzarella, pepperoni, Italian sausage, onions, peppers, and black olives.',
    price: 21.50,
    popular: true,
    tags: ['Classic Favorite'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-honeyed-hawaiian',
    name: 'The Honeyed Hawaiian',
    category: 'red-base-pizza',
    description: 'House red sauce, ham, sweet pineapple, bacon, fresh basil leaves, and finished with a hot honey drizzle.',
    price: 21.00,
    popular: true,
    tags: ['Sweet & Savory', 'Chef Recommended'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Extra Heat',
        choices: [
          { label: 'Regular', extraPrice: 0 },
          { label: 'Add Pickled Jalapenos', extraPrice: 1.50 }
        ]
      }
    ]
  },

  // Chicken Pizza Recipes
  {
    id: 'pizza-garlic-parm-chicken',
    name: 'Garlic Parmesan Bacon Chicken Pizza',
    category: 'chicken-pizza',
    description: 'Garlic Parmesan base, mozzarella, roasted chicken, crispy bacon, and topped with a double portion of fresh Parmesan and basil.',
    price: 20.00,
    popular: true,
    tags: ['Fan Favorite', 'House Specialty'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Topping Additions',
        choices: [
          { label: 'Standard', extraPrice: 0 },
          { label: 'Add Goat Cheese Crumble', extraPrice: 1.50 },
          { label: 'Add Fresh Mushrooms', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-sweet-spicy-thai',
    name: 'Sweet & Spicy Thai Chicken Pizza',
    category: 'chicken-pizza',
    description: 'Thai peanut / garlic honey sauce base, mozzarella, marinated chicken, red onions, fresh basil & peppers, hot honey drizzle.',
    price: 20.00,
    popular: true,
    tags: ['Most Reviewed', 'Must Try'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Greens',
        choices: [
          { label: 'Standard Basil & Peppers', extraPrice: 0 },
          { label: 'Add Fresh Arugula', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-bbq-chicken',
    name: 'BBQ Chicken Pizza',
    category: 'chicken-pizza',
    description: 'Sweet smoky BBQ sauce base, mozzarella, seasoned chicken, and crisp red onions.',
    price: 18.50,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Cheese / Meat Add-ons',
        choices: [
          { label: 'Standard', extraPrice: 0 },
          { label: 'Add Bleu Cheese Crumble', extraPrice: 1.50 },
          { label: 'Add Extra Bacon', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-chicken-bacon-ranch',
    name: 'Chicken Bacon Ranch Pizza',
    category: 'chicken-pizza',
    description: 'Creamy ranch sauce base, melted mozzarella, marinated tender chicken breast, and smoked bacon.',
    price: 18.50,
    popular: true,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Vegetables',
        choices: [
          { label: 'Standard', extraPrice: 0 },
          { label: 'Add Red Onions', extraPrice: 1.50 },
          { label: 'Add Fresh Tomatoes', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-buffalo-wings',
    name: 'Buffalo Wings Pizza',
    category: 'chicken-pizza',
    description: "Cream cheese and Frank's hot sauce base, rich mozzarella, and seasoned chicken bites.",
    price: 17.00,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Kick & Crumbles',
        choices: [
          { label: 'Standard', extraPrice: 0 },
          { label: 'Add Fresh Jalapenos', extraPrice: 1.50 },
          { label: 'Add Bleu Cheese Crumble', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-mango-habanero',
    name: 'Mango Habanero Chicken & Sausage Pizza',
    category: 'chicken-pizza',
    description: 'Sweet and spicy mango habanero base, mozzarella, chicken, sausage, juicy pineapple, and pickled jalapenos.',
    price: 21.50,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Base Option',
        choices: [
          { label: 'Standard Mango Habanero Base', extraPrice: 0 },
          { label: 'Cream Cheese Base Blend', extraPrice: 1.50 }
        ]
      }
    ]
  },

  // Specialty Pizza Recipes
  {
    id: 'pizza-blue-moose',
    name: 'The Blue Moose Pizza',
    category: 'specialty-pizza',
    description: 'Olive oil & garlic butter base, generous covering of blue cheese crumble, topped with prosciutto, fresh arugula, and balsamic vinegar drizzle.',
    price: 19.50,
    popular: true,
    tags: ['Signature Gourmet'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-luau-bbq',
    name: 'Luau BBQ Pizza',
    category: 'specialty-pizza',
    description: 'BBQ sauce base, mozzarella, ham, sweet pineapple, smoked bacon, sliced red onion, and Italian prosciutto.',
    price: 21.00,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Finishing Touches',
        choices: [
          { label: 'Standard', extraPrice: 0 },
          { label: 'Arugula & Balsamic Glaze', extraPrice: 1.50 },
          { label: 'Add Lamana Hot Honey', extraPrice: 1.50 },
          { label: 'Add Marinated Chicken', extraPrice: 2.00 }
        ]
      }
    ]
  },
  {
    id: 'pizza-jalapeno-popper',
    name: 'Jalapeno Popper Pizza',
    category: 'specialty-pizza',
    description: 'Cream cheese base, crisp diced jalapenos, ham, smoked bacon, and finished with hot honey drizzle.',
    price: 19.50,
    popular: true,
    tags: ['Local Favorite'],
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-feta-sausage-mushroom',
    name: 'Feta, Italian Sausage & Mushroom Pizza',
    category: 'specialty-pizza',
    description: 'Alfredo / cream cheese base, rich feta and goat cheese crumble, seasoned Italian sausage, and sautéed mushrooms.',
    price: 18.50,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Add-Ons',
        choices: [
          { label: 'Standard', extraPrice: 0 },
          { label: 'Add Marinated Chicken', extraPrice: 2.00 },
          { label: 'Add Fresh Arugula', extraPrice: 1.50 }
        ]
      }
    ]
  },
  {
    id: 'pizza-veggie-lovers',
    name: 'Veggie Lovers Pizza',
    category: 'specialty-pizza',
    description: 'House Alfredo sauce base, bell peppers, sweet onions, ripe tomatoes, black olives, and fresh mushrooms.',
    price: 18.50,
    options: [
      {
        name: 'Crust Style',
        choices: [
          { label: 'Traditional Brick Oven Crust', extraPrice: 0 },
          { label: 'Cheese Stuffed Crust', extraPrice: 1.50 }
        ]
      },
      {
        name: 'Drizzle',
        choices: [
          { label: 'None', extraPrice: 0 },
          { label: 'Add House Ranch Drizzle', extraPrice: 1.00 }
        ]
      }
    ]
  },

  // Appetizers
  {
    id: 'app-pickle-cigars',
    name: 'Pickle Cigars',
    category: 'appetizers',
    description: 'Four Havarti cheese and egg roll wrapped pickle spears deep fried to golden crisp and served with garlic honey ranch.',
    price: 12.00,
    popular: true,
    image: RESTAURANT_IMAGES.appetizersSpread,
    tags: ['House Specialty', 'Legendary Item'],
    options: [
      {
        name: 'Portion Size',
        choices: [
          { label: 'Full Order (4 Cigars)', extraPrice: 0 },
          { label: 'Half Order (2 Cigars)', extraPrice: -4.00 }
        ]
      }
    ]
  },
  {
    id: 'app-loaded-fries',
    name: 'Gourmet Loaded Fries',
    category: 'appetizers',
    description: 'A full pound of crispy shoestring fries, heavily topped and baked to gooey tavern perfection.',
    price: 13.00,
    popular: true,
    image: RESTAURANT_IMAGES.appetizersSpread,
    tags: ['Baked to Perfection', '1 Pound'],
    options: [
      {
        name: 'Flavor Style',
        choices: [
          { label: 'Garlic, Parmesan & Bacon Fries', extraPrice: 0 },
          { label: 'Bacon & Bleu Cheese Fries', extraPrice: 0 },
          { label: 'Feta, Prosciutto, Basil & Balsamic Fries', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'app-onion-rings',
    name: 'Onion Rings Basket',
    category: 'appetizers',
    description: 'Half pound of thick-cut sweet onion rings in crunchy golden batter. Served with your choice of dipping sauce.',
    price: 8.00,
    popular: true,
    tags: ['Crispy Golden'],
    options: [
      {
        name: 'Complimentary Dipping Sauce',
        choices: [
          { label: 'House Ranch', extraPrice: 0 },
          { label: 'Garlic Honey Ranch', extraPrice: 0 },
          { label: 'Sweet Baby Rays BBQ', extraPrice: 0 },
          { label: 'Frank Buffalo Hot Sauce', extraPrice: 0 },
          { label: 'Marinara', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'app-side-fries',
    name: 'Side of Crispy Shoestring Fries',
    category: 'appetizers',
    description: 'Half pound of seasoned hot fries with one complimentary dipping sauce.',
    price: 6.00,
    options: [
      {
        name: 'Dipping Sauce',
        choices: [
          { label: 'House Ranch', extraPrice: 0 },
          { label: 'Garlic Honey Ranch', extraPrice: 0 },
          { label: 'BBQ Sauce', extraPrice: 0 },
          { label: 'Ketchup & Fry Sauce', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'app-jalapeno-poppers',
    name: 'Jalapeno Poppers',
    category: 'appetizers',
    description: 'Crispy breaded poppers stuffed with smooth cheese and jalapeno heat. Served with mango habanero ranch.',
    price: 12.00,
  },
  {
    id: 'app-chicken-strips-fries',
    name: 'Chicken Strips & Fries Basket',
    category: 'appetizers',
    description: 'Tender, juicy breaded chicken tenderloins served with a generous bed of crispy shoestring fries and dipping sauce.',
    price: 12.00,
    popular: true,
    options: [
      {
        name: 'Dipping Sauce',
        choices: [
          { label: 'Garlic Honey Ranch', extraPrice: 0 },
          { label: 'House Ranch', extraPrice: 0 },
          { label: 'Sweet Baby Rays BBQ', extraPrice: 0 },
          { label: 'Honey Mustard', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'app-shareable-caesar',
    name: 'Shareable Caesar Salad',
    category: 'appetizers',
    description: 'Crisp romaine lettuce, aged parmesan cheese, tossed in our classic Caesar dressing, topped with seasoned crunchy croutons.',
    price: 15.00,
    options: [
      {
        name: 'Salad Portion',
        choices: [
          { label: 'Full Shareable Salad', extraPrice: 0 },
          { label: 'Half Salad', extraPrice: -7.00 }
        ]
      },
      {
        name: 'Add Chicken',
        choices: [
          { label: 'No Meat', extraPrice: 0 },
          { label: 'Add Grilled/Marinated Chicken', extraPrice: 3.00 }
        ]
      }
    ]
  },
  {
    id: 'app-mac-cheese-bites',
    name: 'Mac & Cheese Bites & Fries',
    category: 'appetizers',
    description: 'Creamy macaroni and cheddar cheese enrobed in a golden crispy coating, served hot with crispy fries.',
    price: 10.00
  },
  {
    id: 'app-fried-mushrooms',
    name: 'Fried Mushrooms & House Sauce',
    category: 'appetizers',
    description: 'Plump whole button mushrooms breaded and fried to juicy golden brown perfection with house dipping sauce.',
    price: 8.00
  },
  {
    id: 'app-mozzarella-sticks',
    name: 'Mozzarella Sticks & Marinara',
    category: 'appetizers',
    description: 'Crispy herb-crusted mozzarella sticks with stringy melted cheese center, served with warm house marinara.',
    price: 10.00
  },
  {
    id: 'app-sampler',
    name: 'The Usk Sampler Platter',
    category: 'appetizers',
    description: 'Chicken strips with dipping sauce, choice of shoestring fries or onion rings, and crispy mozzarella sticks with marinara.',
    price: 20.00,
    popular: true,
    options: [
      {
        name: 'Choice of Side',
        choices: [
          { label: 'Shoestring Fries', extraPrice: 0 },
          { label: 'Onion Rings Basket', extraPrice: 0 }
        ]
      }
    ]
  },

  // Wings
  {
    id: 'wings-platter',
    name: 'Signature Tavern Wings (Bone-in or Boneless)',
    category: 'wings',
    description: 'Choice of crispy bone-in or breaded boneless wings smothered in your favorite gourmet sauce. Served with celery & choice of dipping sauce.',
    price: 15.00,
    popular: true,
    tags: ['8 Gourmet Sauces', 'Crowd Favorite'],
    options: [
      {
        name: 'Wing Style',
        choices: [
          { label: 'Bone-In Crispy Wings', extraPrice: 0 },
          { label: 'Breaded Boneless Wings', extraPrice: 0 }
        ]
      },
      {
        name: 'Sauce Flavor',
        choices: [
          { label: 'Franks Classic Buffalo Hot', extraPrice: 0 },
          { label: 'Garlic Honey', extraPrice: 0 },
          { label: 'Garlic Parmesan', extraPrice: 0 },
          { label: 'Sweet Baby Rays BBQ', extraPrice: 0 },
          { label: 'Carolina Tangy BBQ', extraPrice: 0 },
          { label: 'Mango Habanero', extraPrice: 0 },
          { label: 'New Orleans Bourbon BBQ', extraPrice: 0 },
          { label: 'Sweet & Sour', extraPrice: 0 }
        ]
      },
      {
        name: 'Dipping Sauce',
        choices: [
          { label: 'House Ranch', extraPrice: 0 },
          { label: 'Bleu Cheese Dip', extraPrice: 0 },
          { label: 'Garlic Honey Ranch', extraPrice: 0 }
        ]
      }
    ]
  },

  // Drinks
  {
    id: 'drink-pnw-draft',
    name: 'Pacific Northwest Craft Draft Beer Pint',
    category: 'drinks',
    description: 'Rotating selection of regional Washington & Oregon IPAs, ambers, stouts, and blonde ales on draft.',
    price: 6.00,
    options: [
      {
        name: 'Draft Selection',
        choices: [
          { label: 'Local Washington IPA', extraPrice: 0 },
          { label: 'Northwest Amber Ale', extraPrice: 0 },
          { label: 'Hazy Pale Ale', extraPrice: 0 },
          { label: 'Crisp Pilsner', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'drink-domestic-draft',
    name: 'Domestic Cold Draft / Bottle',
    category: 'drinks',
    description: 'Ice-cold classic beers poured fresh from the tap.',
    price: 4.50,
    options: [
      {
        name: 'Selection',
        choices: [
          { label: 'Coors Light Tap', extraPrice: 0 },
          { label: 'Bud Light Tap', extraPrice: 0 },
          { label: 'Rainier Bottle', extraPrice: 0 },
          { label: 'Busch Light Draft', extraPrice: 0 }
        ]
      }
    ]
  },
  {
    id: 'drink-hard-cider',
    name: 'Washington Hard Cider / Seltzer',
    category: 'drinks',
    description: 'Crisp regional apple cider or refreshing flavored spiked seltzer.',
    price: 5.50
  },
  {
    id: 'drink-sodas',
    name: 'Fountain Sodas & Iced Tea',
    category: 'drinks',
    description: 'Coca-Cola, Diet Coke, Sprite, Dr Pepper, Root Beer, Fresh Brewed Iced Tea, Lemonade (Free Refills).',
    price: 3.00,
    options: [
      {
        name: 'Beverage Choice',
        choices: [
          { label: 'Coca-Cola', extraPrice: 0 },
          { label: 'Diet Coke', extraPrice: 0 },
          { label: 'Sprite', extraPrice: 0 },
          { label: 'Dr Pepper', extraPrice: 0 },
          { label: 'Root Beer', extraPrice: 0 },
          { label: 'Fresh Brewed Iced Tea', extraPrice: 0 },
          { label: 'Lemonade', extraPrice: 0 }
        ]
      }
    ]
  }
];

export const BUILD_YOUR_OWN_CONFIG = {
  basePrice: 16.50,
  includedSauceOrCheese: 0,
  crusts: [
    { id: 'traditional', name: '12" Brick Oven Hand-Tossed', price: 0 },
    { id: 'stuffed', name: '12" Cheese Stuffed Crust', price: 1.50 }
  ],
  sauceBases: [
    'House Red Pizza Sauce',
    'House Alfredo',
    'BBQ Sauce',
    'Ranch',
    'Olive Oil Base & Balsamic Drizzle',
    'Mango Habanero',
    'Garlic Honey',
    'Parmesan Garlic',
    'Cream Cheese'
  ],
  meats: [
    { name: 'Pepperoni', price: 1.50 },
    { name: 'Italian Sausage', price: 1.50 },
    { name: 'Prosciutto', price: 1.50 },
    { name: 'Marinated Chicken', price: 2.00 },
    { name: 'Ham', price: 1.50 },
    { name: 'Smoked Bacon', price: 1.50 }
  ],
  veggies: [
    { name: 'Fresh Mushroom', price: 1.50 },
    { name: 'Black Olives', price: 1.50 },
    { name: 'Sweet Red Onion', price: 1.50 },
    { name: 'Bell Peppers', price: 1.50 },
    { name: 'Fresh Arugula', price: 1.50 },
    { name: 'Sweet Pineapple', price: 1.50 },
    { name: 'Diced Tomatoes', price: 1.50 },
    { name: 'Pickled Jalapenos', price: 1.50 },
    { name: 'Fresh Basil Leaves', price: 1.50 }
  ],
  cheeses: [
    { name: 'Extra Mozzarella on top', price: 1.50 },
    { name: 'Bleu Cheese Crumble', price: 1.50 },
    { name: 'Feta Cheese Crumble', price: 1.50 },
    { name: 'Ricotta Cheese Dollops', price: 2.00 }
  ],
  drizzles: [
    { name: "Lamana's Hot Honey", price: 1.50 },
    { name: 'Balsamic Vinegar Glaze', price: 1.50 },
    { name: 'Garlic Honey Drizzle', price: 1.50 },
    { name: 'Mango Habanero Drizzle', price: 1.50 }
  ]
};

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    author: 'Robert Joy',
    authorSubtitle: 'Local Guide · 62 reviews · 3 photos',
    rating: 5,
    timeAgo: '3 months ago',
    comment:
      'Very cute, small town, bar and grill. About half the seating area is family other half is bar. There is a very cute small rec room in the back with free foosball and pool. Just enough room for one group of people to enjoy at a time. Wonderful pizza and great service.',
    tags: ['foosball', 'pool', 'local bar and grill', 'pizza'],
    likes: 4
  },
  {
    id: 'rev-2',
    author: 'Khristopher Thompson',
    authorSubtitle: 'Local Guide · 19 reviews',
    rating: 5,
    timeAgo: '3 months ago',
    comment:
      'Went to the Usk Bar & Grill for the first time the other night, with friends who frequent the establishment. Upon arrival we were greeted quickly and sat at our table. The waitress who served us was polite and efficient. The food (pizza) was top notch!',
    tags: ['pizza', 'service', 'friendly staff'],
    likes: 3
  },
  {
    id: 'rev-3',
    author: 'Eric Grisotti',
    authorSubtitle: '9 reviews · 5 photos',
    rating: 5,
    timeAgo: 'a year ago',
    comment:
      'What a great place! Who knew? In Usk, Washington that we would find such a great little bar and grill. We shared onion rings and a beer to start. While we enjoyed those items, we saw a pizza get delivered to another table. We knew we had to order one too—blistered parmesan butter crust, hot out of the brick oven!',
    tags: ['onion rings', 'beer', 'pizza', 'local bar and grill'],
    likes: 6
  },
  {
    id: 'rev-4',
    author: 'Sarah Jenkins',
    authorSubtitle: '34 reviews · 12 photos',
    rating: 5,
    timeAgo: '2 months ago',
    comment:
      'The Pickle Cigars and Sweet & Spicy Thai Chicken pizza are out of this world! Love that we can bring the kids to the family side or hang in the back with pool and foosball while waiting for the food.',
    tags: ['pickle cigars', 'foosball', 'thai pizza'],
    likes: 5
  },
  {
    id: 'rev-5',
    author: 'Mark Vandenberg',
    authorSubtitle: 'Local Guide · 112 reviews',
    rating: 5,
    timeAgo: '4 months ago',
    comment:
      'Great pit stop while driving through Pend Oreille County. Friendly locals, quick drive-through pickup for hot pizzas, and reasonable prices ($10-$20). Garlic chicken bacon pizza is stellar.',
    tags: ['drive-through', 'local bar and grill', 'pizza', 'reasonable prices'],
    likes: 2
  }
];
