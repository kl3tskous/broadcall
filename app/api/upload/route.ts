import { NextResponse } from 'next/server';
import { getUploadURL } from '@/lib/objectStorage';

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const uploadURL = await getUploadURL();
    return NextResponse.json({ uploadURL });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to get upload URL' },
      { status: 500 }
    );
  }
}
