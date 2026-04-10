import { NextRequest, NextResponse } from 'next/server';

// TODO: cron trigger belirlenecek
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: implement reminder sending
    return NextResponse.json({ success: true, message: 'Reminders sent' });
  } catch (error) {
    console.error('Send reminders cron failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
