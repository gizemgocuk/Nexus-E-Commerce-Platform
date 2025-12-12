import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, DollarSign, Package, Box, Truck, Tag, Settings, Plus, Edit, Trash2, X } from 'lucide-react';
import { Api } from '../../services/api';
import { Order, Product } from '../../types';
import { Card, Badge, Button, Input, Price } from '../../components/Common';
import { useToastStore } from '../../store';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
    >
        {children}
    </button>
);

export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'campaigns'>('overview');
    const [products, setProducts] = useState<Product[]>([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        featured: false,
        images: ''
    });
    const addToast = useToastStore((state) => state.addToast);

    useEffect(() => {
        Api.getAllStats().then((data) => {
            setStats(data);
            setLoading(false);
        });
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await Api.getProducts();
            setProducts(data);
        } catch (error) {
            addToast('Failed to load products', 'error');
        }
    };

    const handleSaveProduct = async () => {
        try {
            const productData = {
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                category: productForm.category,
                stock: parseInt(productForm.stock),
                featured: productForm.featured,
                images: productForm.images ? productForm.images.split(',').map(url => url.trim()) : []
            };

            if (editingProduct) {
                await Api.updateProduct(editingProduct.id, productData);
                addToast('Product updated successfully', 'success');
            } else {
                await Api.createProduct(productData);
                addToast('Product created successfully', 'success');
            }

            setShowProductModal(false);
            setEditingProduct(null);
            resetForm();
            loadProducts();
        } catch (error) {
            addToast('Failed to save product', 'error');
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            featured: product.featured || false,
            images: product.images.join(', ')
        });
        setShowProductModal(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await Api.deleteProduct(id);
            addToast('Product deleted successfully', 'success');
            loadProducts();
        } catch (error) {
            addToast('Failed to delete product', 'error');
        }
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            featured: false,
            images: ''
        });
    };

    const openNewProductModal = () => {
        setEditingProduct(null);
        resetForm();
        setShowProductModal(true);
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    const data = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Enterprise Admin</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" /> Settings</Button>
                </div>
            </div>

            <div className="border-b mb-6">
                <div className="flex gap-2">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                    <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>Products</TabButton>
                    <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Inventory (WMS)</TabButton>
                    <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Orders & Fulfillment</TabButton>
                    <TabButton active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')}>Campaigns</TabButton>
                </div>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                    <p className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full text-green-600">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Orders</p>
                                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Products</p>
                                    <p className="text-2xl font-bold">{products.length}</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-full text-orange-600">
                                    <Package className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full text-purple-600">
                                    <Users className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Chart */}
                        <Card className="p-6">
                            <h3 className="text-lg font-bold mb-4">Weekly Revenue</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Recent Orders */}
                        <Card className="p-0 overflow-hidden">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold">Recent Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Order ID</th>
                                            <th className="px-6 py-3">Customer</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentOrders.map((order: Order) => (
                                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                                <td className="px-6 py-4">{order.shippingAddress.fullName}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={order.status === 'delivered' ? 'success' : 'warning'}>
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'products' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">Product Management</h3>
                        <Button onClick={openNewProductModal}>
                            <Plus className="h-4 w-4 mr-2" /> Add Product
                        </Button>
                    </div>

                    <Card className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Image</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Stock</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4">{product.category}</td>
                                            <td className="px-6 py-4"><Price amount={product.price} /></td>
                                            <td className="px-6 py-4">
                                                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.featured && <Badge variant="success">Featured</Badge>}
                                                {product.stock === 0 && <Badge variant="error">Out of Stock</Badge>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditProduct(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded text-blue-800">
                        <div className="font-bold flex items-center gap-2 mb-2"><Box className="h-5 w-5" /> Warehouse Management System</div>
                        <p className="text-sm">Connecting to Inventory Service Microservice...</p>
                    </div>
                    <Card className="p-6">
                        <h3 className="font-bold mb-4">Low Stock Alerts</h3>
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">SKU</th>
                                    <th className="py-2">Product</th>
                                    <th className="py-2">Variant</th>
                                    <th className="py-2">Warehouse</th>
                                    <th className="py-2">Stock</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-3">HP-GLD</td>
                                    <td>Pro Headphones</td>
                                    <td>Limited Gold</td>
                                    <td>NYC-1</td>
                                    <td className="text-red-500 font-bold">5</td>
                                    <td><Button size="sm" variant="outline">Restock</Button></td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {activeTab === 'campaigns' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-bold">Active Campaigns</h3>
                        <Button><Tag className="h-4 w-4 mr-2" /> New Rule</Button>
                    </div>
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border p-4 rounded bg-green-50 border-green-100">
                                <div>
                                    <h4 className="font-bold text-green-900">Summer Sale 2024</h4>
                                    <p className="text-sm text-green-700">20% off Electronics category</p>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between border p-4 rounded">
                                <div>
                                    <h4 className="font-bold text-gray-900">Free Shipping Threshold</h4>
                                    <p className="text-sm text-gray-500">Free shipping on orders over $100</p>
                                </div>
                                <Badge variant="success">Active</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex gap-4">
                        <Card className="p-4 flex-1 text-center">
                            <div className="text-2xl font-bold">12</div>
                            <div className="text-xs text-gray-500 uppercase">Pending Processing</div>
                        </Card>
                        <Card className="p-4 flex-1 text-center">
                            <div className="text-2xl font-bold">4</div>
                            <div className="text-xs text-gray-500 uppercase">Fraud Checks</div>
                        </Card>
                        <Card className="p-4 flex-1 text-center">
                            <div className="text-2xl font-bold">89</div>
                            <div className="text-xs text-gray-500 uppercase">Shipped Today</div>
                        </Card>
                    </div>
                    <Card className="p-6">
                        <h3 className="font-bold mb-4">Live Order Stream (Kafka Consumers)</h3>
                        <div className="space-y-2">
                            {stats.recentOrders.map((order: Order) => (
                                <div key={order.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                    <div>
                                        <div className="font-medium">Order #{order.id}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm">{order.shippingAddress.fullName}</div>
                                        <Badge variant={order.status === 'delivered' ? 'success' : 'warning'}>{order.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setShowProductModal(false);
                                    setEditingProduct(null);
                                    resetForm();
                                }}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Product Name"
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    placeholder="Enter product name"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        rows={3}
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                        placeholder="Enter product description"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Price (USD)"
                                        type="number"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                    <Input
                                        label="Stock"
                                        type="number"
                                        value={productForm.stock}
                                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <Input
                                    label="Category"
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                    placeholder="e.g., Electronics, Clothing, Furniture"
                                />
                                <Input
                                    label="Image URLs (comma separated)"
                                    value={productForm.images}
                                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                />
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={productForm.featured}
                                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                                        Featured Product
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <Button onClick={handleSaveProduct} className="flex-1">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowProductModal(false);
                                        setEditingProduct(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
