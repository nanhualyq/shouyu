import db from "~/db";

export default defineEventHandler(async event => {
    const body = await readBody(event)
    const keys = Object.keys(body)
    if (!keys.length) {
        throw new Error("body is required");
    }
    return db.prepare(`INSERT INTO card (${keys.join(',')}) 
    VALUES (${keys.map(s => `@${s}`).join(',')})`)
        .run(body)
})