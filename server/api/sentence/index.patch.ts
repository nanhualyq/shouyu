import { Statement } from "better-sqlite3";
import db from "~/db";

export default defineEventHandler(async event => {
    const body = await readBody(event)
    let arr = body
    if (!Array.isArray(body)) {
        arr = [body]
    }
    await db.transaction(() => {
        for (const row of arr) {
            const set = Object.keys(row)
            ?.filter(key => key !== 'id')
            .map(key => `${key}=@${key}`)
            .join(',')
            db.prepare(`UPDATE sentence SET ${set}
        WHERE id=@id`)
                .run(row)
        }
    })()
    return 200
})