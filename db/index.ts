import Database from 'better-sqlite3';
import fs from 'fs'

const config = useRuntimeConfig()
const db = new Database(config.sqliteFile, { verbose: console.log });
db.pragma('journal_mode = WAL');

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

export default db

// migration
if (process.env.NODE_ENV === 'development') {
    function getVersionNumber(filename: string) {
        return +(filename?.match(/^\d+/)?.[0] || '')
    }

    let version = ''
    try {
        version = fs.readFileSync('db/version', 'utf-8')
    } catch (error) {
        version = ''
    }
    const sqlFiles = fs.readdirSync('db/sql')
    sqlFiles.sort((a, b) => getVersionNumber(a) - getVersionNumber(b))

    for (const file of sqlFiles) {
        if (getVersionNumber(file) <= getVersionNumber(version)) {
            continue
        }
        const sql = fs.readFileSync(`db/sql/${file}`, 'utf-8')
        db.exec(sql)
        fs.writeFileSync('db/version', file)
    }
}