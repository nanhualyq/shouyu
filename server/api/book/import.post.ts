export default defineEventHandler(async event => {
    const body = await readBody(event)
    await db.transaction(async () => {
        const { lastInsertRowid } = await db.prepare(`INSERT INTO book (name, cover, skills) VALUES (@name, @cover, @skills)`)
            .run(body?.book)
        for (const row of (body?.sentences || [])) {
            db.prepare(`INSERT INTO sentence (book_id, lesson, position, text_foreign, text_local, media_url, media_start, media_end) VALUES (?, @lesson, @position, @text_foreign, @text_local, @media_url, @media_start, @media_end)`)
                .run(row, lastInsertRowid)
        }
    })()
    return 200
})