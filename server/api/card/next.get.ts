import db from "~/db";

export default defineEventHandler(async event => {
    const query = await getQuery(event)
    let where = []
    let whereStr = ''
    let order = ''
    for (const key of ['book_id', 'lesson', 'position']) {
        if (query[key]) {
            where.push(`${key}=${query[key]}`)
        }
    }
    const { skills, random } = query
    if (skills) {
        const str = (skills as String)
        .split(',')
        .map(s => `'${s}'`)
        .join(',')
        where.push(`skill in (${str})`)
    }
    if (query.new) {
        where.push(`due_time IS NULL`)
    }
    if (query.review) {
        where.push(`date(due_time) <= date()`)
    }
    if (where.length) {
        whereStr = `where ${where.join(' AND ')}`
    }
    if (random) {
        order = 'ORDER BY random()'
    }
    return db.prepare(`SELECT *, count(*) as total FROM (
        SELECT * FROM card 
        LEFT JOIN sentence on (sentence.id = card.sentence_id)
        ${whereStr} ${order} 
    )`)
        .expand()
        .get()
})