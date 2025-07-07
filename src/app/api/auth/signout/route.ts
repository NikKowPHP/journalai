import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { authRateLimiter } from '@/lib/rateLimiter';

export async function POST(request: Request) {
  // Get client IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(/, /)[0] : '127.0.0.1';

  // Apply rate limiting
  const limit = authRateLimiter(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
      {
        status: 429,
        headers: {
          'Retry-After': limit.retryAfter!.toString()
        }
      }
  );
  }

  try {
    const supabase =await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Signout error:', error);
      return NextResponse.json(
        {
          error: error.message,
          code: error.code || 'SIGNOUT_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: { Location: '/login' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Server error during signout:', error);
    return NextResponse.json(
      {
        error: message,
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}