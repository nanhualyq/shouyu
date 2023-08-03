export default defineEventHandler(async event => {
    const body = await readBody(event)
    for (const key of ['book_id', 'lesson']) {
        if (!body[key]) {
            throw createError(`${key} is required`)
        }
    }
    const rows = db.prepare(`SELECT id FROM sentence 
    WHERE book_id=@book_id AND lesson=@lesson
    ORDER BY position`)
        .all(body) as any
    if (!rows?.length) {
        return
    }
    await db.transaction(() => {
        for (let i = 0; i < rows.length; i++) {
            db.prepare(`UPDATE sentence SET position=? WHERE id=?`)
                .run(Date.now() + i + 1, rows?.[i]?.id)
        }
        for (let i = 0; i < rows.length; i++) {
            db.prepare(`UPDATE sentence SET position=? WHERE id=?`)
                .run(i + 1, rows?.[i]?.id)
        }
    })()
    return 200
})