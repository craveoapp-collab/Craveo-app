'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface SharedWishlist {
  id: number;
  title: string;
  description?: string;
  occasion?: string;
  items: any[];
  user: {
    firstName?: string;
    lastName?: string;
  };
}

export default function SharedWishlistPage() {
  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimedItems, setClaimedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const slug = new URLSearchParams(window.location.search).get('slug');
      if (!slug) {
        setError('No wishlist found');
        return;
      }

      const response = await axios.get(`/api/wishlists/share?slug=${slug}`);
      setWishlist(response.data.wishlist);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimItem = async (itemId: number) => {
    try {
      const slug = new URLSearchParams(window.location.search).get('slug');
      if (!wishlist) return;

      await axios.post(`/api/wishlists/${wishlist.id}/items/${itemId}/claim`);
      setClaimedItems(new Set([...claimedItems, itemId]));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Please login to claim items');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          Go Home
        </Link>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Wishlist not found</p>
      </div>
    );
  }

  const ownerName = `${wishlist.user.firstName || 'Someone'} ${wishlist.user.lastName || ''}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {ownerName}'s Wishlist
          </h1>
          <h2 className="text-2xl text-blue-600 mb-3">{wishlist.title}</h2>
          {wishlist.description && (
            <p className="text-gray-600 mb-3">{wishlist.description}</p>
          )}
          {wishlist.occasion && (
            <p className="text-sm text-gray-500">Occasion: {wishlist.occasion}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">This wishlist is currently empty</p>
            </div>
          ) : (
            wishlist.items.map((item) => (
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
                  <p className="text-xs text-green-600 mb-3">✓ Already claimed</p>
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
                  {!item.purchasedAt && (
                    <button
                      onClick={() => handleClaimItem(item.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      {claimedItems.has(item.id) ? '✓ Claimed' : 'Claim Item'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Don't have a Craveo account yet?</p>
          <Link
            href="/auth/register"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
