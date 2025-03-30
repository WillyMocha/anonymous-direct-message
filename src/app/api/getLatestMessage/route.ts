import { NextResponse } from 'next/server';
import { IgApiClient, DirectInboxFeedResponseThreadsItem } from 'instagram-private-api';
import { promisify } from 'util';
import fs from 'fs';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

const ig = new IgApiClient();

// Load session from file to avoid frequent logins
async function loadSession(): Promise<void> {
    try {
        const session = await readFileAsync('./session.json', 'utf8');
        ig.state.deserialize(session);
        console.log('✅ Instagram session loaded.');
    } catch (error) {
        console.log('⚠️ No previous session found.');
    }
}

// Save session to file for reuse
async function saveSession(): Promise<void> {
    const session = await ig.state.serialize();
    await writeFileAsync('./session.json', JSON.stringify(session));
    console.log('✅ Instagram session saved.');
}

export async function GET() {
    try {
        // Initialize Instagram client
        ig.state.generateDevice(process.env.IG_USERNAME ?? '');

        // Load previous session
        await loadSession();

        // Login if session is not available
        if (!ig.state.cookieJar) {
            await ig.account.login(
                process.env.IG_USERNAME ?? '',
                process.env.IG_PASSWORD ?? ''
            );
            await saveSession();
        }

        // Fetch direct messages (DMs)
        const inboxFeed = ig.feed.directInbox();
        const threads: DirectInboxFeedResponseThreadsItem[] = await inboxFeed.items();

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
                  const item = lastItem as any; // Type assertion here
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
