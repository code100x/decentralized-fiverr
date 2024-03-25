import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);

  return NextResponse.json({ address: session?.user?.name ?? 'Not Logged In' });
}
