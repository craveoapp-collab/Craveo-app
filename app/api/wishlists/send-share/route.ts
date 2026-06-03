import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { sendWishlistSharedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    let token = extractTokenFromHeader(
      request.headers.get('Authorization') || ''
    );

    if (!token) {
      const authToken = request.cookies.get('authToken')?.value;
      token = authToken || null;
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wishlistId, emails } = body;

    if (!wishlistId || !emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Wishlist ID and email list are required' },
        { status: 400 }
      );
    }

    // Get wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
      include: {
        user: true,
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Check if user owns the wishlist
    if (wishlist.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Send emails
    const senderName = `${wishlist.user.firstName || 'Someone'} ${wishlist.user.lastName || ''}`;
    const wishlistLink = `${process.env.NEXT_PUBLIC_APP_URL}/wishlists/shared?slug=${wishlist.slug}`;

    for (const email of emails) {
      try {
        await sendWishlistSharedEmail(email, senderName, wishlist.title, wishlistLink);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }

    return NextResponse.json(
      { message: 'Wishlist shared successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Share wishlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
