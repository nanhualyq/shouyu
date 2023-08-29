import assert from "assert"

export default defineEventHandler(async event => {
    const body = await readBody(event)
    assert(Array.isArray(body), 'body is not Array')
    return db.prepare(`DELETE FROM sentence
        WHERE id in (${body.join(',')})`)
        .run()
})