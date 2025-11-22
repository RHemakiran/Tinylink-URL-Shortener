import { NextResponse } from 'next/server';

const startTime = Date.now();

// GET /healthz - Health check endpoint
export async function GET() {
  const uptime = Math.floor((Date.now() - startTime) / 1000); // seconds

  return NextResponse.json({
    ok: true,
    version: '1.0',
    uptime: uptime,
    timestamp: new Date().toISOString(),
  });
}

