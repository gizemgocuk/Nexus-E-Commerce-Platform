import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store';
import { Button, Card, Price } from '../components/Common';

export const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
              // Calculate effective price for this item variant
              const variant = item.variants?.find(v => v.id === item.selectedVariantId);
              const effectivePrice = item.price + (variant?.priceModifier || 0);

              return (
                <Card key={`${item.id}-${item.selectedVariantId}`} className="p-4 flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                            {item.category}
                            {variant && <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700">{variant.name}</span>}
                        </p>
                      </div>
                      <Price amount={effectivePrice * item.quantity} className="font-bold text-gray-900" />
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-3 border rounded-md p-1">
                        <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariantId)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariantId)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id, item.selectedVariantId)}
                        className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                </Card>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm border-b pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <Price amount={total()} className="font-medium" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (Estimate)</span>
                <Price amount={total() * 0.08} className="font-medium" />
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold">Total</span>
              <Price amount={total() * 1.08} className="text-xl font-bold text-primary-600" />
            </div>
            
            <Button className="w-full mb-3" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            
            <Link to="/shop" className="block text-center text-sm text-primary-600 hover:underline">
               Continue Shopping
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
