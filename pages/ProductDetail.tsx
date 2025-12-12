import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Truck, ShieldCheck, ArrowLeft, Heart, Share2, Info } from 'lucide-react';
import { Api } from '../services/api';
import { Product } from '../types';
import { useCartStore, useToastStore, useSettingsStore } from '../store';
import { Button, Badge, Price, Card } from '../components/Common';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        Api.getProduct(id),
        Api.getRelatedProducts(id)
      ]).then(([prod, recs]) => {
        setProduct(prod || null);
        setRelatedProducts(recs);
        if (prod?.variants && prod.variants.length > 0) {
          setSelectedVariantId(prod.variants[0].id);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, selectedVariantId);
      addToast(`Added ${product.name} to cart`, 'success');
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading product data...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button variant="outline" onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const currentPrice = product.price + (selectedVariant?.priceModifier || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <img src={product.images[0]} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-primary-600 font-medium tracking-wide uppercase text-sm">{product.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-900">{product.rating}</span>
            </div>
            <span className="text-gray-500 text-sm">{product.reviews} verified reviews</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium text-sm`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-2">
            <Price amount={currentPrice} />
          </div>
          <p className="text-xs text-gray-500 mb-8">
            Tax included. Shipping calculated at checkout.
          </p>

          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Configuration</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-4 py-2 rounded border text-sm transition-all ${selectedVariantId === variant.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium ring-1 ring-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {variant.name} {variant.priceModifier > 0 && (
                      <span className="ml-1">(+<Price amount={variant.priceModifier} />)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-8">
            <Button size="lg" className="flex-1 text-lg h-12" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="outline" size="lg" className="h-12 aspect-square p-0">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="lg" className="h-12 aspect-square p-0">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <div className="border-t pt-8 space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <Truck className="h-5 w-5" />
              <span>Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <ShieldCheck className="h-5 w-5" />
              <span>2 year extended warranty included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t pt-16">
          <h2 className="text-2xl font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rec => (
              <Link to={`/product/${rec.id}`} key={rec.id} onClick={() => window.scrollTo(0, 0)}>
                <Card className="h-full hover:shadow-lg transition-shadow p-4">
                  <div className="aspect-square bg-gray-100 rounded mb-4 overflow-hidden">
                    <img src={rec.images[0]} alt={rec.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{rec.name}</h3>
                  <div className="flex justify-between items-center">
                    <Price amount={rec.price} className="text-primary-600" />
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {rec.rating}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
