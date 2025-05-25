import { NextResponse } from 'next/server';
import { initInstagram } from '@/lib/InstagramSession';

export async function GET() {
  try {
    const ig = await initInstagram();
    const inboxFeed = ig.feed.directInbox();
    const threads = await inboxFeed.items();

    return NextResponse.json({ messages: threads });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error fetching Instagram messages:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


//for testing using powershell
//curl -Uri "http://localhost:3000/api/loadMessage" -Method Get
