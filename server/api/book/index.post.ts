export default defineEventHandler(async event => {
    const body = await readBody(event)
    return db.prepare(`INSERT INTO book (name, cover, skills) VALUES (@name, @cover, @skills);`)
    .run(body)
})