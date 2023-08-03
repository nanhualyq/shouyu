import { Database } from 'better-sqlite3'
import fs from 'fs'

function getVersionNumber(filename: string) {
    return +(filename?.match(/^\d+/)?.[0] || '')
}

export default function (db: Database) {
    console.log('start migration');

    let version = ''
    try {
        version = db.prepare('SELECT version FROM migration')
            .pluck()
            .get() as string
    } catch (error) {
        version = ''
    }
    const sqlFiles = fs.readdirSync('sql')
    sqlFiles.sort((a: String, b: String) => {
        return getVersionNumber(a + '') - getVersionNumber(b + '')
    })

    for (const file of sqlFiles) {
        if (getVersionNumber(file) <= getVersionNumber(version)) {
            console.log('skip: ', file);
            continue
        }
        const sql = fs.readFileSync(`sql/${file}`, 'utf-8')
        db.exec(sql)
        db.prepare('UPDATE migration SET version=?, time=datetime() WHERE rowid=1')
            .run(file)
    }

    console.log('end migration');
}