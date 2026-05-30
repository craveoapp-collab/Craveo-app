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

    // Fetch wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { id: wishlistId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Check visibility
    const decoded = token ? verifyToken(token) : null;
    if (
      wishlist.visibility === 'private' &&
      (!decoded || decoded.userId !== wishlist.userId)
    ) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        wishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { title, description, occasion, visibility } = body;

    // Update wishlist
    const updatedWishlist = await prisma.wishlist.update({
      where: { id: wishlistId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(occasion !== undefined && { occasion }),
        ...(visibility && { visibility }),
      },
    });

    return NextResponse.json(
      {
        message: 'Wishlist updated successfully',
        wishlist: updatedWishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update wishlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Delete wishlist (cascades to items)
    await prisma.wishlist.delete({
      where: { id: wishlistId },
    });

    return NextResponse.json(
      {
        message: 'Wishlist deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete wishlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
