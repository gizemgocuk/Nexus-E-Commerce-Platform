export type Role = 'user' | 'admin';
export type Language = 'en' | 'tr' | 'de';
export type Currency = 'USD' | 'EUR' | 'TRY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Blue / L"
  sku: string;
  priceModifier: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price in USD
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  currency: Currency;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'fraud_check';
  createdAt: string;
  shippingAddress: Address;
  timeline: OrderTimeline[];
  paymentGateway: 'Stripe' | 'PayPal' | 'Iyzico' | 'PayTR' | 'COD';
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
