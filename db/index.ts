import Database from 'better-sqlite3';

const config = useRuntimeConfig()
const db = new Database(config.sqliteFile, { verbose: console.log });
db.pragma('journal_mode = WAL');

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export default db