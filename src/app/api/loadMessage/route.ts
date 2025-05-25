import { NextResponse } from 'next/server';
import { initInstagram } from '@/lib/InstagramSession';

export async function GET() {
  try {
    const ig = await initInstagram();
    const inboxFeed = ig.feed.directInbox();
    const threads = await inboxFeed.items();

    return NextResponse.json({ messages: threads });
  } catch (err: any) {
    console.error('❌ Error fetching Instagram messages:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


//for testing using powershell
//curl -Uri "http://localhost:3000/api/loadMessage" -Method Get
