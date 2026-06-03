'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.get(`/api/auth/verify-email?token=${token}`);
        setVerified(true);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to verify email');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        {loading && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Verifying your email...</h1>
            <p className="mt-2 text-gray-600">Please wait.</p>
          </>
        )}

        {verified && (
          <>
            <h1 className="text-2xl font-bold text-green-600">✓ Email Verified!</h1>
            <p className="mt-2 text-gray-600">Your email has been verified successfully.</p>
            <Link href="/auth/login" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Go to Login
            </Link>
          </>
        )}

        {error && !loading && (
          <>
            <h1 className="text-2xl font-bold text-red-600">✗ Verification Failed</h1>
            <p className="mt-2 text-gray-600">{error}</p>
            <Link href="/auth/register" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
