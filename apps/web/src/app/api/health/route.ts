import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
  let databaseStatus: 'not_configured' | 'connected' | 'unreachable' =
    databaseConfigured ? 'unreachable' : 'not_configured';

  if (databaseConfigured) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed', error);
    }
  }

  const databaseReady = databaseStatus === 'connected';
  const serviceReady = !databaseConfigured || databaseReady;

  return NextResponse.json(
    {
      status: serviceReady ? 'ok' : 'degraded',
      service: 'qaddem-web',
      databaseConfigured,
      databaseReady,
      databaseStatus,
      timestamp: new Date().toISOString(),
    },
    {
      status: serviceReady ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
