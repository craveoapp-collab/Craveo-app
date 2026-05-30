import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const wishlistId = parseInt(params.id);

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

    // Get all items for the wishlist
    const items = await prisma.wishlistItem.findMany({
      where: { wishlistId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        items,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const wishlistId = parseInt(params.id);

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

    // Parse request body
    const body = await request.json();
    const { productName, productUrl, description, price, priority, imageUrl } = body;

    // Validation
    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Create item
    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId,
        productName,
        productUrl: productUrl || null,
        description: description || null,
        price: price ? parseFloat(price) : null,
        priority: priority || 'medium',
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Item added successfully',
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
