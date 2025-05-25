// src/lib/InstagramSession.ts
import { IgApiClient } from 'instagram-private-api';
import fs from 'fs';
import { promisify } from 'util';

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
  } catch (err) {
    console.log(`🔁 Session invalid or missing. Logging in as ${username}...`);

    try {
      try {
        await ig.simulate.preLoginFlow();
      } catch (e: any) {
        if (e.response?.statusCode !== 404) throw e;
        console.warn('⚠️ Skipping preLoginFlow due to 404');
      }

      await ig.account.login(username, password);

      try {
        await ig.simulate.postLoginFlow();
      } catch (e: any) {
        if (e.response?.statusCode !== 404) throw e;
        console.warn('⚠️ Skipping postLoginFlow due to 404');
      }

      const session = await ig.state.serialize();
      delete session.constants;
      await writeFileAsync('./session.json', JSON.stringify(session));

      console.log('✅ New Instagram session saved.');
    } catch (loginErr: any) {
      console.error('❌ Login failed:', JSON.stringify(loginErr.response?.body || loginErr.message, null, 2));
      throw new Error('Instagram login failed');
    }
  }

  return ig;
}
