import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2, CreditCard, Shield, AlertTriangle } from 'lucide-react';
import { useCartStore, useAuthStore, useSettingsStore } from '../store';
import { Api } from '../services/api';
import { Button, Input, Card, Price } from '../components/Common';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(4, 'ZIP code is required'),
  cardNumber: z.string().min(16, 'Invalid card number').max(19),
  expiry: z.string().min(5, 'Format MM/YY'),
  cvc: z.string().min(3, 'CVC required'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing_stripe' | 'failed_stripe' | 'processing_paypal' | 'success'>('idle');
  const [orderId, setOrderId] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
    }
  });

  const onSubmit = async (data: CheckoutForm) => {
    // 1. Try Stripe (Simulated)
    setPaymentStatus('processing_stripe');
    
    // Simulate slight network delay
    setTimeout(async () => {
         // Randomly fail Stripe to demonstrate failover (10% chance in this mock)
         const stripeShouldFail = Math.random() > 0.9;
         
         if (stripeShouldFail) {
             setPaymentStatus('failed_stripe');
             
             // 2. Retry with PayPal/PayTR logic after 1.5s delay
             setTimeout(async () => {
                 setPaymentStatus('processing_paypal');
                 await processOrder(data, 'PayTR');
             }, 1500);
         } else {
             await processOrder(data, 'Stripe');
         }
    }, 1500);
  };

  const processOrder = async (data: CheckoutForm, gateway: any) => {
    try {
      const order = await Api.createOrder({
        userId: user?.id || 'guest',
        items,
        total: total() * 1.08,
        currency,
        shippingAddress: {
            fullName: data.fullName,
            street: data.address,
            city: data.city,
            state: 'NY', // Mock
            zip: data.zip,
            country: 'USA'
        },
        paymentGateway: gateway
      });
      
      setOrderId(order.id);
      setPaymentStatus('success');
      clearCart();
    } catch (error) {
      console.error(error);
      setPaymentStatus('idle'); // In real app, show error state
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Thank you for your purchase. Your payment was securely processed.
          Your order ID is #{orderId}.
        </p>
        <div className="flex gap-4">
            <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
            {user && <Button variant="outline" onClick={() => navigate('/')}>View Order Timeline</Button>}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
      navigate('/cart');
      return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Forms */}
        <div className="space-y-6">
          <Card className="p-6">
             <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
             <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
                <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
                <Input label="Street Address" error={errors.address?.message} {...register('address')} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="City" error={errors.city?.message} {...register('city')} />
                    <Input label="ZIP Code" error={errors.zip?.message} {...register('zip')} />
                </div>
             </form>
          </Card>

          <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Payment Details
              </h2>
              <div className="space-y-4">
                  <Input label="Card Number" placeholder="0000 0000 0000 0000" error={errors.cardNumber?.message} {...register('cardNumber')} />
                  <div className="grid grid-cols-2 gap-4">
                      <Input label="Expiry Date" placeholder="MM/YY" error={errors.expiry?.message} {...register('expiry')} />
                      <Input label="CVC" placeholder="123" error={errors.cvc?.message} {...register('cvc')} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border">
                      <Shield className="h-4 w-4 text-green-600" />
                      Payments are secure and encrypted. We support failover orchestration.
                  </div>
              </div>
          </Card>
        </div>

        {/* Order Review */}
        <div>
            <Card className="p-6 sticky top-24 bg-gray-50/50">
                <h2 className="text-lg font-semibold mb-4">Order Review</h2>
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                    {items.map((item) => (
                        <div key={`${item.id}-${item.selectedVariantId}`} className="flex gap-3">
                            <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover rounded bg-white" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{item.name}</span>
                                    <Price amount={(item.price + (item.variants?.find(v => v.id === item.selectedVariantId)?.priceModifier || 0)) * item.quantity} />
                                </div>
                                <div className="text-xs text-gray-500">
                                    Qty: {item.quantity}
                                    {item.selectedVariantId && ` • ${item.variants?.find(v => v.id === item.selectedVariantId)?.name}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <Price amount={total()} />
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <Price amount={total() * 1.08} />
                    </div>
                </div>

                <Button 
                    className="w-full mt-6" 
                    size="lg" 
                    form="checkout-form" 
                    type="submit"
                    disabled={paymentStatus !== 'idle'}
                >
                    {paymentStatus === 'idle' && 'Pay Now'}
                    
                    {paymentStatus === 'processing_stripe' && (
                         <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing via Stripe...</span>
                    )}

                    {paymentStatus === 'failed_stripe' && (
                        <span className="flex items-center gap-2 text-yellow-200"><AlertTriangle className="h-4 w-4" /> Gateway Timeout. Retrying...</span>
                    )}

                     {paymentStatus === 'processing_paypal' && (
                         <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Failover to PayTR...</span>
                    )}
                </Button>
            </Card>
        </div>
      </div>
    </div>
  );
};
