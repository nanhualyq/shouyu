export default defineEventHandler(async event => {
    const body = await readBody(event)
    let arr = body
    if (!Array.isArray(body)) {
        arr = [body]
    }
    await db.transaction(() => {
        for (const row of arr) {
            const keys = Object.keys(row)
            db.prepare(`REPLACE INTO sentence
            (${keys.join(',')})
            VALUES (${keys.map(s => `@${s}`).join(',')})`)
                .run(row)
        }
    })()
    return 200
})