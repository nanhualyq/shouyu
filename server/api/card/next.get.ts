import db from "~/db";

export default defineEventHandler(async event => {
    const query = await getQuery(event)
    let where = ''
    for (const key of ['book_id', 'lesson', 'position']) {
        if (query[key]) {
            if (where) {
                where += ' AND '
            }
            where += `${key}=${query[key]}`
        }
    }
    const { skills, random } = query
    if (skills) {
        const str = (skills as String)
            .split(',')
            .map(s => `'${s}'`)
            .join(',')
        where += ` AND skill in (${str})`
    }
    if (random) {
        where += ' ORDER BY random()'
    }
    if (where) {
        where = `where ${where}`
    }
    return db.prepare(`SELECT *, count(*) as total FROM (
        SELECT * FROM card 
        LEFT JOIN sentence on (sentence.id = card.sentence_id)
        ${where} 
    )`)
        .expand()
        .get()
})