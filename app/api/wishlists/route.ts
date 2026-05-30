import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Get all wishlists for this user
    const wishlists = await prisma.wishlist.findMany({
      where: { userId: decoded.userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      {
        wishlists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get wishlists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Parse request body
    const body = await request.json();
    const { title, description, occasion, visibility } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: decoded.userId,
        title,
        description: description || null,
        occasion: occasion || null,
        visibility: visibility || 'private',
        slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      },
    });

    return NextResponse.json(
      {
        message: 'Wishlist created successfully',
        wishlist,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create wishlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
