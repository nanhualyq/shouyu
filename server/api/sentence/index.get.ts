import db from "~/db";

export default defineEventHandler(event => {
    const query = getQuery(event)
    const where = Object.entries(query)
        .map(([key, val]) => `${key}=${val}`)
        .join(' AND ')
    return db.prepare(`select * from sentence where ${where}`).all()
})