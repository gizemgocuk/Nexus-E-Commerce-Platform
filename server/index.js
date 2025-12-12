import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Database (In-Memory for Demo) ---
let PRODUCTS = [
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

const USERS = [
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

let ORDERS = [
  {
    id: 'ord_123',
    userId: 'u2',
    items: [{ ...PRODUCTS[0], quantity: 1 }],
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
      { status: 'created', timestamp: new Date().toISOString(), description: 'Order received' },
      { status: 'delivered', timestamp: new Date().toISOString(), description: 'Delivered' },
    ]
  }
];

// --- Routes ---

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Nexus E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin/stats'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const user = USERS.find(u => u.email === normalizedEmail);

  if (user) {
    res.json({ user, token: `jwt_token_${user.id}_${Date.now()}` });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Products
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

app.get('/api/products/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ message: 'Product not found' });
});

app.get('/api/products/:id/related', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (!product) return res.json([]);
  const related = PRODUCTS.filter(p => p.id !== req.params.id && p.category === product.category);
  res.json(related.length > 0 ? related : PRODUCTS.slice(0, 3));
});

// Admin Product Management
app.post('/api/admin/products', (req, res) => {
  const newProduct = {
    id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: req.body.name,
    description: req.body.description || '',
    price: parseFloat(req.body.price) || 0,
    category: req.body.category || 'Other',
    images: req.body.images || ['https://picsum.photos/400/400?random=' + Math.floor(Math.random() * 100)],
    stock: parseInt(req.body.stock) || 0,
    rating: 0,
    reviews: 0,
    featured: req.body.featured || false,
    variants: req.body.variants || []
  };
  PRODUCTS.push(newProduct);
  res.json(newProduct);
});

app.put('/api/admin/products/:id', (req, res) => {
  const index = PRODUCTS.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  PRODUCTS[index] = {
    ...PRODUCTS[index],
    ...req.body,
    id: req.params.id // Ensure ID doesn't change
  };
  res.json(PRODUCTS[index]);
});

app.delete('/api/admin/products/:id', (req, res) => {
  const index = PRODUCTS.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  PRODUCTS.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Orders
app.get('/api/orders', (req, res) => {
  // In a real app, verify token and filter by user
  res.json(ORDERS);
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    ...req.body,
    id: `ord_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'processing',
    timeline: [
      { status: 'created', timestamp: new Date().toISOString(), description: 'Order created via ' + (req.body.paymentGateway || 'API') },
      { status: 'paid', timestamp: new Date().toISOString(), description: 'Payment captured' }
    ]
  };
  ORDERS.unshift(newOrder);
  res.json(newOrder);
});

// Stats (Admin)
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalSales: ORDERS.reduce((acc, curr) => acc + curr.total, 0),
    totalOrders: ORDERS.length,
    totalUsers: USERS.length,
    recentOrders: ORDERS.slice(0, 5)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
