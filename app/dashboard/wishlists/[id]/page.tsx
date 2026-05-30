'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

interface WishlistItem {
  id: number;
  productName: string;
  productUrl?: string;
  description?: string;
  price?: number;
  priority: string;
  imageUrl?: string;
  purchasedBy?: number;
  purchasedAt?: string;
  createdAt: string;
}

interface Wishlist {
  id: number;
  title: string;
  description?: string;
  occasion?: string;
  visibility: string;
}

export default function WishlistDetailPage() {
  const params = useParams();
  const wishlistId = parseInt(params.id as string);

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    productUrl: '',
    description: '',
    price: '',
    priority: 'medium',
    imageUrl: '',
  });
  const [adding, setAdding] = useState(false);

  // Fetch wishlist and items on mount
  useEffect(() => {
    fetchWishlist();
    fetchItems();
  }, [wishlistId]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`/api/wishlists/${wishlistId}`);
      setWishlist(response.data.wishlist);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load wishlist');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/wishlists/${wishlistId}/items`);
      setItems(response.data.items);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      const response = await axios.post(`/api/wishlists/${wishlistId}/items`, formData);
      setItems([response.data.item, ...items]);
      setFormData({
        productName: '',
        productUrl: '',
        description: '',
        price: '',
        priority: 'medium',
        imageUrl: '',
      });
      setShowAddForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`/api/wishlists/${wishlistId}/items/${itemId}`);
      setItems(items.filter((i) => i.id !== itemId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Wishlist not found</p>
        <Link href="/dashboard/wishlists" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Back to Wishlists
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/wishlists" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Wishlists
        </Link>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{wishlist.title}</h1>
          {wishlist.description && (
            <p className="text-gray-600 mb-2">{wishlist.description}</p>
          )}
          <div className="flex gap-4 text-sm text-gray-500">
            {wishlist.occasion && <span>Occasion: {wishlist.occasion}</span>}
            <span>Visibility: {wishlist.visibility}</span>
            <span>{items.length} items</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Items</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Add New Item</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Apple AirPods Pro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 249.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product URL
              </label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/product"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add Item'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">No items in this wishlist yet.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{item.productName}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority}
                </span>
              </div>
              {item.price && (
                <p className="text-lg font-semibold text-blue-600 mb-2">${item.price.toFixed(2)}</p>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              {item.purchasedAt && (
                <p className="text-xs text-green-600 mb-3">✓ Claimed</p>
              )}
              <div className="flex gap-2">
                {item.productUrl && (
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm text-center hover:bg-gray-300"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
