import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
    itemId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const wishlistId = parseInt(params.id);
    const itemId = parseInt(params.itemId);

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

    // Check if item belongs to a public or link-only wishlist
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: {
        wishlist: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.wishlist.visibility === 'private') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update item with purchaser info
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        purchasedBy: decoded.userId,
        purchasedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Item claimed successfully',
        item: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Claim item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
