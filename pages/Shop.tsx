import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Api } from '../services/api';
import { Product } from '../types';
import { Button, Card, Input, Select, Price } from '../components/Common';
import { useCartStore, useToastStore } from '../store';
import { Star, SlidersHorizontal, Eye } from 'lucide-react';

export const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<string>('featured');
  const [search, setSearch] = useState('');
  const addItem = useCartStore((state) => state.addItem);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    Api.getProducts().then((data) => {
      setProducts(data);
      setFilteredProducts(data);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search
    if (search) {
        result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Sort
    if (sort === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [category, sort, search, products]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation if clicked on card
    addItem(product);
    addToast(`Added ${product.name} to cart`, 'success');
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category.toLowerCase())))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 space-y-6 flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg mb-4">
            <SlidersHorizontal className="h-5 w-5" /> Filters
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat}
                      checked={category === cat}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="capitalize text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
               <label className="text-sm font-medium mb-2 block">Price Range</label>
               <div className="flex gap-2">
                   <Input placeholder="Min" type="number" className="w-full" />
                   <Input placeholder="Max" type="number" className="w-full" />
               </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Shop All</h1>
            <div className="w-48">
              <Select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={[
                  { value: 'featured', label: 'Featured' },
                  { value: 'low-high', label: 'Price: Low to High' },
                  { value: 'high-low', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Highest Rated' },
                ]}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found matching your criteria.</p>
                <Button variant="ghost" className="mt-2" onClick={() => {setCategory('all'); setSearch('');}}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id}>
                    <Card className="group flex flex-col h-full hover:shadow-lg transition-all">
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <Eye className="h-4 w-4" /> View Details
                             </span>
                         </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium">{product.rating}</span>
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <Price amount={product.price} className="font-bold text-lg" />
                                <Button size="sm" onClick={(e) => handleAddToCart(e, product)}>Add</Button>
                            </div>
                        </div>
                    </Card>
                </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
