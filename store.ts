import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, CartItem, AuthState, Language, Currency } from './types';

// --- Settings Store (I18n & Currency) ---
interface SettingsState {
  language: Language;
  currency: Currency;
  exchangeRates: Record<Currency, number>;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  convertPrice: (priceInUsd: number) => number;
  formatPrice: (priceInUsd: number) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'en',
      currency: 'USD',
      // Mock live FX rates
      exchangeRates: {
        USD: 1,
        EUR: 0.92,
        TRY: 32.50,
      },
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      convertPrice: (priceInUsd) => {
        const { currency, exchangeRates } = get();
        return priceInUsd * exchangeRates[currency];
      },
      formatPrice: (priceInUsd) => {
        const { currency, exchangeRates } = get();
        const value = priceInUsd * exchangeRates[currency];
        return new Intl.NumberFormat(get().language, {
          style: 'currency',
          currency: currency,
        }).format(value);
      },
    }),
    { name: 'settings-storage' }
  )
);

// --- Cart Store ---
interface CartState {
  items: CartItem[];
  addItem: (product: Product, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variantId) => {
        const currentItems = get().items;
        // Check for same product AND same variant
        const existingItemIndex = currentItems.findIndex(
            item => item.id === product.id && item.selectedVariantId === variantId
        );

        if (existingItemIndex > -1) {
          const newItems = [...currentItems];
          newItems[existingItemIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1, selectedVariantId: variantId }] });
        }
      },
      removeItem: (productId, variantId) => {
        set({ 
            items: get().items.filter(item => !(item.id === productId && item.selectedVariantId === variantId)) 
        });
      },
      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map(item =>
            (item.id === productId && item.selectedVariantId === variantId) ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, item) => {
          let price = item.price;
          // Add variant price modifier if exists
          if(item.selectedVariantId && item.variants) {
              const variant = item.variants.find(v => v.id === item.selectedVariantId);
              if(variant) price += variant.priceModifier;
          }
          return acc + price * item.quantity;
      }, 0),
    }),
    { name: 'cart-storage' }
  )
);

// --- Auth Store ---
interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      login: (user, token) => set({ user, isAuthenticated: true, token }),
      logout: () => set({ user: null, isAuthenticated: false, token: null }),
    }),
    { name: 'auth-storage' }
  )
);

// --- Toast Store ---
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000); 
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
