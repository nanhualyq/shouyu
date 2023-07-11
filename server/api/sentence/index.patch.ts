import { Statement } from "better-sqlite3";
import db from "~/db";

export default defineEventHandler(async event => {
    const body = await readBody(event)
    let arr = body
    if (!Array.isArray(body)) {
        arr = [body]
    }
    let sqls:Array<Statement> = []
    for (const row of arr) {
        let set = ''
        for (const key of Object.keys(row)) {
            if (key === 'id') {
                continue
            }
            if (set) {
                set += ','
            }
            let val = row[key]
            // fix: error when val like "Here's your coat"
            if (typeof val === 'string') {
                val = val.replace(/\'/g, "''")
            }
            set += `${key}='${val}'`
        }
        if (!set) {
            throw Error(`${row} is empty`)
        }
        sqls.push(db.prepare(`UPDATE sentence SET ${set}
        WHERE id=${row.id}`))
    }
    await db.transaction(() => {
        for (const sql of sqls) {
            sql.run()
        }
    })()
    return 200
})