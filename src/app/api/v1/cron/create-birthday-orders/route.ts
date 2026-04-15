import { NextRequest, NextResponse } from 'next/server';

// TODO: cron trigger belirlenecek
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement birthday order creation logic
    return NextResponse.json({ success: true, message: 'Birthday orders created' });
  } catch (error) {
    console.error('Birthday orders cron failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
