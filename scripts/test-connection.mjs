import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

async function tryConnect(label, opts) {
  const sql = postgres(url, { max: 1, connect_timeout: 10, ...opts });
  try {
    const rows = await sql`select current_database() as db, current_user as "user", version() as version`;
    console.log(`[${label}] OK ->`, rows[0]);
    await sql.end();
    return true;
  } catch (err) {
    console.log(`[${label}] FAIL ->`, err.code || '', err.message);
    try { await sql.end({ timeout: 1 }); } catch {}
    return false;
  }
}

(async () => {
  if (await tryConnect('ssl:off', { ssl: false })) return;
  if (await tryConnect('ssl:require', { ssl: 'require' })) return;
  if (await tryConnect('ssl:prefer', { ssl: 'prefer' })) return;
  if (await tryConnect('ssl:no-verify', { ssl: { rejectUnauthorized: false } })) return;
  process.exit(1);
})();
