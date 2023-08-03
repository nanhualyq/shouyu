export default defineEventHandler(async event => {
    // const { id } = getRouterParams(event)
    return db.prepare(`DELETE FROM card`)
        .run()
})