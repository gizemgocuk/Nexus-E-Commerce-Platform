import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard, Search, Globe, ChevronDown } from 'lucide-react';
import { useCartStore, useAuthStore, useToastStore, useSettingsStore } from '../store';
import { Button } from './Common';
import { ToastContainer } from './Toast';
import { Language, Currency } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemsCount = useCartStore((state) => state.items.length);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { language, currency, setLanguage, setCurrency } = useSettingsStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <ToastContainer />
      
      {/* Top Bar (Enterprise Feature) */}
      <div className="bg-gray-900 text-gray-300 text-xs py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex gap-4">
                <span>Call Us: +1 800 NEXUS</span>
                <span>Help Center</span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-1 cursor-pointer hover:text-white group relative">
                    <Globe className="h-3 w-3" />
                    <span className="uppercase">{language}</span>
                    <ChevronDown className="h-3 w-3" />
                    
                    {/* Language Dropdown */}
                    <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 shadow-lg rounded-md overflow-hidden hidden group-hover:block z-50 w-24">
                        {(['en', 'tr', 'de'] as Language[]).map(lang => (
                             <button key={lang} onClick={() => setLanguage(lang)} className="block w-full text-left px-4 py-2 hover:bg-gray-100 uppercase">
                                 {lang}
                             </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-white group relative">
                    <span>{currency}</span>
                    <ChevronDown className="h-3 w-3" />

                     {/* Currency Dropdown */}
                     <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 shadow-lg rounded-md overflow-hidden hidden group-hover:block z-50 w-24">
                        {(['USD', 'EUR', 'TRY'] as Currency[]).map(curr => (
                             <button key={curr} onClick={() => setCurrency(curr)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                 {curr}
                             </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
              <Package className="h-6 w-6" />
              <span>Nexus</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
              {isAdmin && (
                <Link to="/admin" className="text-primary-600 flex items-center gap-1">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex relative group">
                <input 
                    type="text" 
                    placeholder="Search for products, brands..." 
                    className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-80 transition-all border border-transparent focus:bg-white"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium leading-none">{user?.name}</span>
                    <span className="text-xs text-gray-500">{user?.role}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="primary" size="sm">Sign In</Button>
              </Link>
            )}

            <button 
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t p-4 bg-white space-y-4">
            <nav className="flex flex-col gap-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">Home</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="font-medium">Shop</Link>
              {isAdmin && (
                 <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-primary-600">Admin Dashboard</Link>
              )}
              {!isAuthenticated && (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="font-medium text-primary-600">Sign In</Link>
              )}
            </nav>
            <div className="pt-4 border-t flex gap-4 text-sm font-medium text-gray-600">
                <button onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}>Lang: {language.toUpperCase()}</button>
                <button onClick={() => setCurrency(currency === 'USD' ? 'EUR' : 'USD')}>Curr: {currency}</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12 text-gray-600">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" /> Nexus
                </h3>
                <p className="text-sm">Premium e-commerce experience for modern shoppers. Quality products, fast delivery.</p>
                <div className="mt-4 flex gap-2">
                    {/* Mock Payment Icons */}
                    <div className="h-6 w-10 bg-gray-200 rounded"></div>
                    <div className="h-6 w-10 bg-gray-200 rounded"></div>
                    <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
                <ul className="space-y-2 text-sm">
                    <li><Link to="/shop?category=electronics" className="hover:text-primary-600">Electronics</Link></li>
                    <li><Link to="/shop?category=clothing" className="hover:text-primary-600">Clothing</Link></li>
                    <li><Link to="/shop?category=furniture" className="hover:text-primary-600">Furniture</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-primary-600">About Us</a></li>
                    <li><a href="#" className="hover:text-primary-600">Careers</a></li>
                    <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                    <li><a href="#" className="hover:text-primary-600">Contact Us</a></li>
                    <li><a href="#" className="hover:text-primary-600">FAQ</a></li>
                    <li><a href="#" className="hover:text-primary-600">Shipping</a></li>
                </ul>
            </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t text-center text-sm">
            &copy; {new Date().getFullYear()} Nexus E-Commerce. Enterprise Edition.
        </div>
      </footer>
    </div>
  );
};
