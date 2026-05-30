import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
    itemId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Check if user owns the wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    if (wishlist.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if item belongs to the wishlist
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.wishlistId !== wishlistId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { productName, productUrl, description, price, priority, imageUrl } = body;

    // Update item
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: itemId },
      data: {
        ...(productName && { productName }),
        ...(productUrl !== undefined && { productUrl }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(priority && { priority }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(
      {
        message: 'Item updated successfully',
        item: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if user owns the wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    if (wishlist.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if item belongs to the wishlist
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.wishlistId !== wishlistId) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Delete item
    await prisma.wishlistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      {
        message: 'Item deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
