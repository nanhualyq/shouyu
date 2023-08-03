export default defineEventHandler(async event => {
    const query = getQuery(event)
    if (!query.limit) {
        query.limit = 20
    }
    const whereArr = []
    for (const key of Object.keys(query)) {
        if (['limit', 'offset'].includes(key)) {
            continue
        }
        if (query[key]) {
            let sql = ''
            if (['book_id', 'skill'].includes(key)) {
                sql = `${key}=@${key}`
            } else {
                sql = `${key} LIKE ('%' || @${key} || '%')`
            }
            whereArr.push(sql)
        }
    }
    let where = ''
    if (whereArr.length) {
        where = `WHERE ${whereArr.join(' AND ')}`
    }
    const data = await db.prepare(`SELECT *, card.id as id FROM card
    LEFT JOIN sentence ON (card.sentence_id = sentence.id) ${where}
    LIMIT @limit
    OFFSET @offset`)
        .all(query)
    const total = await db.prepare(`SELECT count(*) as total FROM card
    LEFT JOIN sentence ON (card.sentence_id = sentence.id) ${where}`)
        .pluck()
        .get(query)
    return {
        data,
        total
    }
})