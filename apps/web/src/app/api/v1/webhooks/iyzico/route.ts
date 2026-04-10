import { NextRequest, NextResponse } from 'next/server';

// TODO: implement iyzico webhook handling
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('iyzico webhook received:', body);
  return NextResponse.json({ ok: true });
}
