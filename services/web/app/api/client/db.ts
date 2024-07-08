import { Pool } from 'pg';

let pool: Pool | null = null;

const getConnectionConfig = () => {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_SSL_MODE } =
    process.env;
  if (!DB_HOST)
    throw Error('Please set the `DB_HOST` as an environment variable');
  if (!DB_PORT)
    throw Error('Please set the `DB_PORT` as an environment variable');
  if (!DB_NAME)
    throw Error('Please set the `DB_NAME` as an environment variable');
  if (!DB_USERNAME)
    throw Error('Please set the `DB_USERNAME` as an environment variable');
  if (!DB_PASSWORD)
    throw Error('Please set the `DB_PASSWORD` as an environment variable');
  if (!DB_SSL_MODE)
    throw Error('Please set the `DB_SSL_MODE` as an environment variable');

  return {
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    ssl: DB_SSL_MODE === 'true' ? true : false,
    idleTimeoutMillis: 30 * 1000, // 30 seconds
  };
};

/**
 * Get a PostgreSQL connection `pool`, this pool manages the clients creation and idle automatically.
 * Please use this `getDBPool` for all of you `SELECT` query.
 *
 * DO NOT RELEASE the `pool` after your query, it'll be released before this service's `exit()`.
 *
 * {@link https://node-postgres.com/features/transactions Transactions}
 *
 * {@link https://node-postgres.com/apis/pool pg.Pool}
 * @returns {Pool}
 */
const getDBPool = () => {
  if (pool) return pool;

  try {
    const config = getConnectionConfig();
    pool = new Pool({
      ...config,
      max: 4,
    });
  } catch (error) {
    throw error;
  }

  return pool;
};

/**
 * Seems we don't have a suitable place to put `process.on` in Next.js
 *  for graceful shutting down service
 * So no where to call this destroy function, only can rely on `idleTimeoutMillis`
 */
const destroyDBPool = async () => {
  console.info('[DB] releasing `pool`.');
  await pool?.end();
  console.info('[DB] `pool` has been released');
};

export { getDBPool, destroyDBPool };
