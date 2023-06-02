import db from "~/db";

export default defineEventHandler(event => {
    return db.prepare('select * from book').all()
})