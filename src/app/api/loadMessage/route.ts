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

        return NextResponse.json({ messages: threads });
    } catch (error: any) {
        console.error('❌ Error fetching Instagram messages:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

//for testing using powershell
//curl -Uri "http://localhost:3000/api/loadMessage" -Method Get
