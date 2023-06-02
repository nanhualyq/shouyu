import db from "~/db";

export default defineEventHandler(event => {
    return db
        .prepare('select lesson from sentence where book_id=? group by lesson')
        .pluck()
        .all(event.context.params.id)
    // return [1,2,3]
})