'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface WishlistItem {
  id: number;
  productName: string;
  productUrl?: string;
  description?: string;
  price?: number;
  priority: string;
  imageUrl?: string;
  purchasedBy?: string | number;
  purchasedAt?: string;
}

interface Wishlist {
  id: number;
  title: string;
  description?: string;
  occasion?: string;
  visibility: string;
  items: WishlistItem[];
  user: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
}

export default function PublicWishlistPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchWishlist();
  }, [slug]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/public/wishlists/${slug}`);
      setWishlist(response.data.wishlist);
      setError('');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to load wishlist'
      );
      setWishlist(null);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/wishlists/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/" className="text-blue-600 hover:text-blue-700">
            Go to home
          </a>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Wishlist not found</p>
      </div>
    );
  }

  const ownerName = wishlist.user.firstName
    ? `${wishlist.user.firstName} ${wishlist.user.lastName || ''}`
    : 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{wishlist.title}</h1>
              <p className="text-gray-600 mt-2">From {ownerName}</p>
              {wishlist.description && (
                <p className="text-gray-600 mt-1">{wishlist.description}</p>
              )}
              {wishlist.occasion && (
                <p className="text-sm text-gray-500 mt-1">Occasion: {wishlist.occasion}</p>
              )}
            </div>
            <button
              onClick={copyShareLink}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {copiedLink ? '✓ Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {wishlist.items.length} Items
        </h2>

        {wishlist.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">This wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 flex-1">
                    {item.productName}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : item.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                {item.price && (
                  <p className="text-lg font-semibold text-blue-600 mb-2">
                    ${item.price.toFixed(2)}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                )}
                {item.purchasedBy && (
                  <p className="text-xs text-green-600 mb-3">✓ Already claimed</p>
                )}
                {item.productUrl && (
                  <a
                    href={item.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700 transition"
                  >
                    View Product
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
