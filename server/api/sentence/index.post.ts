export default defineEventHandler(async event => {
    const body = await readBody(event)
    return db.prepare(`INSERT INTO sentence (book_id, lesson, position, text_foreign, text_local) VALUES (@book_id, @lesson, @position, @text_foreign, @text_local);`).run(body)
})