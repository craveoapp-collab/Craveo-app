import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.pathname.split('/').pop();

    if (!slug) {
      return NextResponse.json(
        { error: 'Wishlist slug is required' },
        { status: 400 }
      );
    }

    // Find wishlist by slug
    const wishlist = await prisma.wishlist.findUnique({
      where: { slug },
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
    if (wishlist.visibility === 'private') {
      return NextResponse.json(
        { error: 'This wishlist is private' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        wishlist: {
          ...wishlist,
          items: wishlist.items.map((item) => ({
            ...item,
            // Don't expose purchasedBy for public view
            purchasedBy: item.purchasedBy ? 'claimed' : null,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get public wishlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
