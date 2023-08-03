export default defineEventHandler(async event => {
    const body = await readBody(event)
    return db.prepare(`UPDATE book SET name=@name, cover=@cover, skills=@skills
    WHERE id=?`)
    .run(event?.context?.params?.id, body)
})