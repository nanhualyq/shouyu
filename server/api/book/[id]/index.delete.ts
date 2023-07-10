import db from "~/db";

export default defineEventHandler(async event => {
    const { id } = getRouterParams(event)
    return db.prepare(`DELETE FROM book
        WHERE id=?`)
        .run(id)
})