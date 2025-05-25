import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import { promisify } from 'util';
import { isIgResponseErrorWithStatus } from '@/lib/InstagramErrorUtils';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

const ig = new IgApiClient();

export async function initInstagram(): Promise<IgApiClient> {
  const username = process.env.IG_USERNAME;
  const password = process.env.IG_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing IG credentials');
  }

  ig.state.generateDevice(username);

  try {
    await loadSession();
    await ig.account.currentUser();
  } catch (err: unknown) {
    logSessionError(err, username);
    await loginAndSaveSession(username, password);
  }

  return ig;
}

async function loadSession() {
  const session = await readFileAsync('./session.json', 'utf8');
  ig.state.deserialize(session);
  console.log('✅ Instagram session loaded.');
}

function logSessionError(err: unknown, username: string) {
  const reason = err instanceof Error ? err.message : String(err);
  console.warn(`🔁 Session invalid or missing. Logging in as ${username}...`);
  console.error('📛 Session load failed:', reason);
}

async function loginAndSaveSession(username: string, password: string) {
  await safelyRun(() => ig.simulate.preLoginFlow(), 'preLoginFlow');

  await ig.account.login(username, password);

  await safelyRun(() => ig.simulate.postLoginFlow(), 'postLoginFlow');

  const session = await ig.state.serialize();
  delete session.constants;
  await writeFileAsync('./session.json', JSON.stringify(session));

  console.log('✅ New Instagram session saved.');
}

async function safelyRun(fn: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await fn();
  } catch (e: unknown) {
    if (isIgResponseErrorWithStatus(e, 404)) {
      console.warn(`⚠️ Skipping ${label} due to 404`);
    } else {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`❌ ${label} failed:`, msg);
      throw new Error(msg);
    }
  }
}
