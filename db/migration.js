const Database = require('better-sqlite3')
const fs = require('fs')

const db = new Database('db/sqlite/data.db', { verbose: console.log });
db.pragma('journal_mode = WAL');

function getVersionNumber(filename) {
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