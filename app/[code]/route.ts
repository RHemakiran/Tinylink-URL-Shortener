import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /:code - Redirect to original URL
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Update click count and last clicked time
    await prisma.link.update({
      where: { code },
      data: {
        clicks: {
          increment: 1,
        },
        lastClicked: new Date(),
      },
    });

    // Return 302 redirect
    return NextResponse.redirect(link.url, { status: 302 });
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Failed to redirect' },
      { status: 500 }
    );
  }
}

