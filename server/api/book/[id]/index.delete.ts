export default defineEventHandler(async event => {
    const id = getRouterParam(event, 'id')
    return db.prepare(`DELETE FROM book
        WHERE id=?`)
        .run(id)
})