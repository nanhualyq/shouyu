import { H3Event } from 'h3'

export default async function (event: H3Event, tableName: string) {
    const body = await readBody(event)
    let arr = body
    if (!Array.isArray(body)) {
        arr = [body]
    }
    return db.transaction(() => {
        for (const row of arr) {
            const set = Object.keys(row)
                ?.filter(key => key !== 'id')
                .map(key => `${key}=@${key}`)
                .join(',')
            db.prepare(`UPDATE ${tableName} SET ${set}
        WHERE id=@id`)
                .run(row)
        }
    })()
}