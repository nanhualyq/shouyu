export default defineEventHandler(async event => {
    const { id } = getRouterParams(event)
    return db.prepare(`DELETE FROM sentence
        WHERE id=?`)
        .run(id)
})