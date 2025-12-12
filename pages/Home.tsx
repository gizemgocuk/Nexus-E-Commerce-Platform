import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck, Eye } from 'lucide-react';
import { Api } from '../services/api';
import { Product } from '../types';
import { Button, Card } from '../components/Common';
import { useCartStore, useToastStore } from '../store';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    Api.getProducts().then((products) => {
      setFeaturedProducts(products.filter((p) => p.featured));
    }).catch(err => console.error("API Connection Error:", err));
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addItem(product);
    addToast(`Added ${product.name} to cart`, 'success');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-90"></div>
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80)' }}
        ></div>
        <div className="container mx-auto px-4 relative py-24 md:py-32">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Discover Quality <br/>
              <span className="text-primary-400">Without Compromise</span>
            </h1>
            <p className="text-lg text-gray-300">
              Shop the latest trends in electronics, fashion, and home decor. 
              Enjoy fast shipping and premium support on all orders.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/shop">
                <Button size="lg" className="gap-2">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                  View Collections
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, title: 'Trending Styles', desc: 'Curated collections of the latest trends.' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure payment processing with Stripe.' },
            { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over $100.' },
          ].map((feature, idx) => (
            <Card key={idx} className="p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-lg">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id}>
              <Card className="group flex flex-col h-full hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 shadow-sm">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Eye className="h-4 w-4" /> View Details
                         </span>
                   </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    <span className="text-sm text-gray-400">({product.reviews})</span>
                  </div>
                  <div className="mt-auto">
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4">
          <div className="bg-primary-900 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Join our Newsletter</h2>
              <p className="text-primary-200 mb-8 max-w-xl mx-auto">Sign up for exclusive offers, original stories, activism, events and more.</p>
              <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 rounded-md border-0 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-white"
                  />
                  <Button variant="primary" className="bg-white text-primary-900 hover:bg-gray-100">Subscribe</Button>
              </form>
          </div>
      </section>
    </div>
  );
};
