import { NextResponse } from 'next/server';
import { DirectInboxFeedResponseThreadsItem } from 'instagram-private-api';
import { initInstagram } from '@/lib/InstagramSession';

export async function GET() {
  try {
    // Init and login Instagram session
    const ig = await initInstagram();

    // Fetch direct messages (DMs)
    const inboxFeed = ig.feed.directInbox();
    const threads: DirectInboxFeedResponseThreadsItem[] = await inboxFeed.items();

    // Format last messages
    const lastMessages = threads.map((thread) => {
      const lastItem = thread.last_permanent_item;
      let text = 'No message';
      let mediaUrl: string | null = null;
      const itemType = lastItem?.item_type ?? 'unknown';

      if (lastItem) {
        switch (itemType) {
          case 'text':
            text = lastItem.text ?? 'No message';
            break;

          case 'media':
          case 'image': {
            const item = lastItem as any;
            mediaUrl = item.media?.image_versions2?.candidates?.[0]?.url ?? null;
            text = '[Image]';
            break;
          }

          case 'video': {
            const item = lastItem as any;
            mediaUrl = item.video_versions?.[0]?.url ?? null;
            text = '[Video]';
            break;
          }

          case 'story_share': {
            const item = lastItem as any;
            text = `[Story Share] ${item.story_share?.title ?? ''}`;
            mediaUrl = item.story_share?.media?.image_versions2?.candidates?.[0]?.url ?? null;
            break;
          }

          case 'link': {
            const item = lastItem as any;
            text = `[Link] ${item.link?.text ?? item.link?.links?.[0]?.text ?? 'URL'}`;
            break;
          }

          default:
            text = `[${itemType}]`;
        }
      }

      return {
        usernames: thread.users?.map(user => user.username).join(', ') ?? 'Unknown',
        text,
        mediaUrl,
        itemType,
      };
    });

    return NextResponse.json({ messages: lastMessages });
  } catch (error: any) {
    console.error('❌ Error fetching Instagram messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//for testing using powershell
//curl -Uri "http://localhost:3000/api/getLatestMessage" -Method Get
