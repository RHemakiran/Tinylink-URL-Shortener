import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/links/:code - Get stats for a specific code
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

    return NextResponse.json(link);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    );
  }
}

// DELETE /api/links/:code - Delete a link
export async function DELETE(
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

    await prisma.link.delete({
      where: { code },
    });

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}

