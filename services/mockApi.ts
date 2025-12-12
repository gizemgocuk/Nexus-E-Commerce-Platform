import { Product, User, Order } from '../types';

// Seed Data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pro Noise-Cancelling Headphones',
    description: 'Experience premium sound quality with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    category: 'Electronics',
    images: ['https://picsum.photos/400/400?random=1'],
    stock: 50,
    rating: 4.8,
    reviews: 120,
    featured: true,
    variants: [
        { id: 'v1_1', name: 'Black', sku: 'HP-BLK', priceModifier: 0, stock: 20 },
        { id: 'v1_2', name: 'Silver', sku: 'HP-SLV', priceModifier: 10, stock: 15 },
        { id: 'v1_3', name: 'Limited Gold', sku: 'HP-GLD', priceModifier: 50, stock: 5 },
    ]
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    description: 'Designed for comfort and productivity with adjustable lumbar support.',
    price: 199.99,
    category: 'Furniture',
    images: ['https://picsum.photos/400/400?random=2'],
    stock: 20,
    rating: 4.5,
    reviews: 85,
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    description: 'Track your health metrics, workouts, and sleep patterns with precision.',
    price: 149.50,
    category: 'Electronics',
    images: ['https://picsum.photos/400/400?random=3'],
    stock: 100,
    rating: 4.6,
    reviews: 230,
    featured: true,
  },
  {
    id: '4',
    name: 'Minimalist Backpack',
    description: 'Water-resistant, durable, and stylish backpack for daily commute.',
    price: 79.99,
    category: 'Accessories',
    images: ['https://picsum.photos/400/400?random=4'],
    stock: 45,
    rating: 4.7,
    reviews: 60,
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    description: 'Tactile switches and RGB lighting for the ultimate typing experience.',
    price: 129.00,
    category: 'Electronics',
    images: ['https://picsum.photos/400/400?random=5'],
    stock: 30,
    rating: 4.9,
    reviews: 310,
    featured: true,
    variants: [
        { id: 'v5_1', name: 'Blue Switches', sku: 'KB-BLU', priceModifier: 0, stock: 10 },
        { id: 'v5_2', name: 'Red Switches', sku: 'KB-RED', priceModifier: 5, stock: 10 },
    ]
  },
  {
    id: '6',
    name: 'Organic Cotton T-Shirt',
    description: 'Soft, breathable, and sustainably sourced cotton t-shirt.',
    price: 25.00,
    category: 'Clothing',
    images: ['https://picsum.photos/400/400?random=6'],
    stock: 200,
    rating: 4.2,
    reviews: 45,
    variants: [
        { id: 'v6_1', name: 'White / S', sku: 'TS-W-S', priceModifier: 0, stock: 20 },
        { id: 'v6_2', name: 'White / M', sku: 'TS-W-M', priceModifier: 0, stock: 30 },
        { id: 'v6_3', name: 'White / L', sku: 'TS-W-L', priceModifier: 0, stock: 30 },
        { id: 'v6_4', name: 'Black / M', sku: 'TS-B-M', priceModifier: 2, stock: 25 },
    ]
  }
];

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Demo Admin',
    email: 'admin@nexus.com',
    role: 'admin',
    avatar: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 'u2',
    name: 'John Doe',
    email: 'user@nexus.com',
    role: 'user',
    avatar: 'https://picsum.photos/100/100?random=11'
  }
];

let orders: Order[] = [
    {
        id: 'ord_123',
        userId: 'u2',
        items: [
            {...MOCK_PRODUCTS[0], quantity: 1}
        ],
        total: 299.99,
        currency: 'USD',
        status: 'delivered',
        createdAt: new Date().toISOString(),
        paymentGateway: 'Stripe',
        shippingAddress: {
            fullName: 'John Doe',
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'USA'
        },
        timeline: [
            { status: 'created', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), description: 'Order received' },
            { status: 'paid', timestamp: new Date(Date.now() - 86400000 * 2.9).toISOString(), description: 'Payment confirmed via Stripe' },
            { status: 'shipped', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Package handed to carrier' },
            { status: 'delivered', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), description: 'Delivered to front porch' },
        ]
    }
];

export const MockApi = {
  login: async (email: string): Promise<{ user: User; token: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Robust email matching: lowercase and trim
        const normalizedEmail = email.toLowerCase().trim();
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === normalizedEmail);
        
        if (user) {
          resolve({ user, token: `mock_token_${user.id}` });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  getProducts: async (): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_PRODUCTS]), 300);
    });
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_PRODUCTS.find(p => p.id === id)), 200);
    });
  },

  getRelatedProducts: async (productId: string): Promise<Product[]> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              // Return products from same category or random products
              const product = MOCK_PRODUCTS.find(p => p.id === productId);
              if(!product) { resolve([]); return; }
              const related = MOCK_PRODUCTS.filter(p => p.id !== productId && p.category === product.category);
              resolve(related.length > 0 ? related : MOCK_PRODUCTS.slice(0, 3));
          }, 400);
      });
  },

  createOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'timeline'>): Promise<Order> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrder: Order = {
          ...order,
          id: `ord_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          status: 'processing',
          timeline: [
              { status: 'created', timestamp: new Date().toISOString(), description: 'Order created' },
              { status: 'fraud_check', timestamp: new Date().toISOString(), description: 'Fraud risk score calculated: Low' },
              { status: 'paid', timestamp: new Date().toISOString(), description: 'Payment authorized' }
          ]
        };
        orders.unshift(newOrder);
        resolve(newOrder);
      }, 1500); // Simulate longer payment orchestration
    });
  },

  getOrders: async (): Promise<Order[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...orders]), 400));
  },
  
  // Admin only
  getAllStats: async () => {
     return new Promise((resolve) => {
         setTimeout(() => {
             resolve({
                 totalSales: orders.reduce((acc, curr) => acc + curr.total, 0),
                 totalOrders: orders.length,
                 totalUsers: MOCK_USERS.length,
                 recentOrders: orders.slice(0, 5)
             })
         }, 300)
     })
  }
};