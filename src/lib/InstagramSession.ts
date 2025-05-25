import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import { promisify } from 'util';
import {
  isIgResponseError,
  isIgResponseErrorWithStatus,
} from '@/lib/InstagramErrorUtils';

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
    const session = await readFileAsync('./session.json', 'utf8');
    ig.state.deserialize(session);
    console.log('✅ Instagram session loaded.');

    await ig.account.currentUser();
  } catch (err: unknown) {
    console.log(`🔁 Session invalid or missing. Logging in as ${username}...`);

    try {
      // preLoginFlow with safe handling
      try {
        await ig.simulate.preLoginFlow();
      } catch (e: unknown) {
        if (isIgResponseErrorWithStatus(e, 404)) {
          console.warn('⚠️ Skipping preLoginFlow due to 404');
        } else {
          const msg = e instanceof Error ? e.message : String(e);
          console.error('❌ preLoginFlow failed:', msg);
          throw new Error(msg);
        }
      }

      // Perform login
      await ig.account.login(username, password);

      // postLoginFlow with safe handling
      try {
        await ig.simulate.postLoginFlow();
      } catch (e: unknown) {
        if (isIgResponseErrorWithStatus(e, 404)) {
          console.warn('⚠️ Skipping postLoginFlow due to 404');
        } else {
          const msg = e instanceof Error ? e.message : String(e);
          console.error('❌ postLoginFlow failed:', msg);
          throw new Error(msg);
        }
      }

      const session = await ig.state.serialize();
      delete session.constants;
      await writeFileAsync('./session.json', JSON.stringify(session));

      console.log('✅ New Instagram session saved.');
    } catch (loginErr: unknown) {
      const message =
        loginErr instanceof Error ? loginErr.message : String(loginErr);
      const body =
        isIgResponseError(loginErr) && loginErr.response?.body
          ? JSON.stringify(loginErr.response.body, null, 2)
          : message;

      console.error('❌ Login failed:', body);
      throw new Error('Instagram login failed');
    }
  }

  return ig;
}
