import db from "~/db";

export default defineEventHandler(event => {
    return db.prepare('select * from book where id=?').get(event.context.params.id)
})