import axios from 'axios';
import { Product, User, Order } from '../types';

const API_URL = 'http://localhost:3001/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const Api = {
  login: async (email: string): Promise<{ user: User; token: string }> => {
    const response = await client.post('/auth/login', { email });
    return response.data;
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await client.get('/products');
    return response.data;
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    try {
        const response = await client.get(`/products/${id}`);
        return response.data;
    } catch (e) {
        return undefined;
    }
  },

  getRelatedProducts: async (productId: string): Promise<Product[]> => {
      try {
        const response = await client.get(`/products/${productId}/related`);
        return response.data;
      } catch (e) {
          return [];
      }
  },

  createOrder: async (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'timeline'>): Promise<Order> => {
    // Simulate orchestration delay for UX
    await new Promise(resolve => setTimeout(resolve, 800)); 
    const response = await client.post('/orders', order);
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await client.get('/orders');
    return response.data;
  },
  
  // Admin only
  getAllStats: async () => {
     const response = await client.get('/admin/stats');
     return response.data;
  },

  // Admin Product Management
  createProduct: async (product: Omit<Product, 'id' | 'rating' | 'reviews'>): Promise<Product> => {
    const response = await client.post('/admin/products', product);
    return response.data;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await client.put(`/admin/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await client.delete(`/admin/products/${id}`);
  }
};