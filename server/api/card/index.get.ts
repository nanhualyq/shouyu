import db from "~/db";

export default defineEventHandler(async event => {
    const query = getQuery(event)
    const whereArr = []
    for (const key of Object.keys(query)) {
        if (['limit', 'offset'].includes(key)) {
            continue
        }
        if (query[key]) {
            let sql = ''
            if (key === 'book_id') {
                sql = `${key}=${query[key]}`
            } else {
                sql = `${key} LIKE '%${query[key]}%'`
            }
            whereArr.push(sql)
        }
    }
    let where = ''
    if (whereArr.length) {
        where = `WHERE ${whereArr.join(' AND ')}`
    }
    const data = await db.prepare(`SELECT *, card.id as id FROM card
    LEFT JOIN sentence ON (card.sentence_id = sentence.id)
    ${where}
    LIMIT ${query.limit || 20}
    OFFSET ${query.offset}`)
        .all()
    const total = await db.prepare(`SELECT count(*) as total FROM card
    LEFT JOIN sentence ON (card.sentence_id = sentence.id)
    ${where}`)
        .pluck()
        .get()
    return {
        data,
        total
    }
})