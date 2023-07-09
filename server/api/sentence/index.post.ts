import db from "~/db";

export default defineEventHandler(async event => {
    const body = await readBody(event)
    return db.prepare(`INSERT INTO sentence (book_id, lesson, position, text_forigen, text_local) VALUES (@book_id, @lesson, @position, @text_forigen, @text_local);`).run(body)
})