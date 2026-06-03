'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-verify on mount if token is present
  React.useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify', { token });
      setMessage(response.data.message);
      setError('');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Verifying your email address...
          </p>
        </div>

        <div className="mt-8">
          {loading && (
            <div className="text-center">
              <p className="text-gray-600">Verifying...</p>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-800">{message}</p>
              <p className="text-xs text-green-600 mt-2">Redirecting to login...</p>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-center">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <div className="mt-4">
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 text-sm">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
