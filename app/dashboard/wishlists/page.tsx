'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Wishlist {
  id: number;
  title: string;
  description?: string;
  occasion?: string;
  visibility: string;
  slug?: string;
  items: any[];
  createdAt: string;
}

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    occasion: '',
    visibility: 'private',
  });
  const [creating, setCreating] = useState(false);

  // Fetch wishlists on mount
  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlists');
      setWishlists(response.data.wishlists);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load wishlists');
      setWishlists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await axios.post('/api/wishlists', formData);
      setWishlists([response.data.wishlist, ...wishlists]);
      setFormData({ title: '', description: '', occasion: '', visibility: 'private' });
      setShowCreateForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create wishlist');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      await axios.delete(`/api/wishlists/${id}`);
      setWishlists(wishlists.filter((w) => w.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete wishlist');
    }
  };

  const copyShareLink = (wishlist: Wishlist) => {
    if (!wishlist.slug) return;
    const link = `${window.location.origin}/wishlists/${wishlist.slug}`;
    navigator.clipboard.writeText(link);
    alert('Share link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading wishlists...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlists</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : '+ New Wishlist'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Wishlist</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Birthday Gifts"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occasion
                </label>
                <input
                  type="text"
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Birthday"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">Private</option>
                  <option value="link-only">Link Only</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Wishlist'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlists.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">You haven't created any wishlists yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Your First Wishlist
            </button>
          </div>
        ) : (
          wishlists.map((wishlist) => (
            <div key={wishlist.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{wishlist.title}</h3>
                  {wishlist.occasion && (
                    <p className="text-sm text-gray-500">{wishlist.occasion}</p>
                  )}
                </div>
                <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                  {wishlist.visibility}
                </span>
              </div>
              {wishlist.description && (
                <p className="text-sm text-gray-600 mb-3">{wishlist.description}</p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                {wishlist.items.length} items
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/wishlists/${wishlist.id}`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700"
                >
                  View
                </Link>
                {(wishlist.visibility === 'public' || wishlist.visibility === 'link-only') && (
                  <button
                    onClick={() => copyShareLink(wishlist)}
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={() => handleDelete(wishlist.id)}
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
