import db from "~/db";

export default defineEventHandler(async event => {
    const body = await readBody(event)
    // 新建的填空卡片不当作新卡用
    if (body.cloze) {
        body.skilled = 0
        body.due_time = db.prepare(`SELECT datetime('now', '+10 minutes')`).pluck().get()
    }
    const keys = Object.keys(body)
    if (!keys.length) {
        throw new Error("body is required");
    }
    return db.prepare(`INSERT INTO card (${keys.join(',')}) 
    VALUES (${keys.map(s => `@${s}`).join(',')})`)
        .run(body)
})