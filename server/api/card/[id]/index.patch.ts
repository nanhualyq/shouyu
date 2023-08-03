export default defineEventHandler(async event => {
    const body = await readBody(event)
    const { id } = getRouterParams(event)
    let set = ''
    for (const key of Object.keys(body)) {
        const val = body[key]
        if (set) {
            set += ','
        }
        set += `${key}=`
        if (key === 'due_time') {
            set += `datetime('now', '${val}')`
        } else {
            set += `'${val}'`
        }
    }
    if (!set) {
        throw Error('body is empty')
    }
    set += `,update_time=datetime()`
    return db.prepare(`UPDATE card SET ${set}
        WHERE id=?`)
        .run(id)
})