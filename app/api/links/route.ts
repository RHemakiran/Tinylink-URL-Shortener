import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidUrl, isValidCode, generateRandomCode } from '@/lib/utils';

// GET /api/links - List all links
export async function GET() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000);
    });

    const linksPromise = prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const links = await Promise.race([linksPromise, timeoutPromise]) as any;

    return NextResponse.json(links);
  } catch (error: any) {
    console.error('Error fetching links:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please check your DATABASE_URL.' },
        { status: 503 }
      );
    }
    
    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Cannot reach database server. Please check your DATABASE_URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch links', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, code: customCode } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format. Must start with http:// or https://' },
        { status: 400 }
      );
    }

    // Handle custom code or generate one
    let code: string;
    if (customCode) {
      if (!isValidCode(customCode)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }
      code = customCode;
    } else {
      // Generate a unique random code
      let attempts = 0;
      do {
        code = generateRandomCode();
        const existing = await prisma.link.findUnique({
          where: { code },
        });
        if (!existing) break;
        attempts++;
        if (attempts > 10) {
          return NextResponse.json(
            { error: 'Failed to generate unique code. Please try again.' },
            { status: 500 }
          );
        }
      } while (true);
    }

    // Check if code already exists
    const existing = await prisma.link.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        code,
        url,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    console.error('Error creating link:', error);
    
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

