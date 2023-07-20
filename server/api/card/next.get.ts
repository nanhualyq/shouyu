import db from "~/db";

function queryNextCard(where: string, order: string) {
    const sql = `SELECT *, count(*) as total FROM (
        SELECT * FROM card 
        LEFT JOIN sentence on (sentence.id = card.sentence_id)
        ${where} ${order} 
    )`
    return db.prepare(sql).expand().get()
}

export default defineEventHandler(async event => {
    const query = await getQuery(event)
    let where = []
    let whereStr = ''
    let order = ''
    for (const key of ['book_id', 'lesson', 'position', 'card.id']) {
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

    // 分钟级别的到期卡
    const minuteCardWhere = [
        ...where,
        'datetime(due_time) <= datetime()',
        'skilled = 0'
    ]
    whereStr = `where ${minuteCardWhere.join(' AND ')}`
    order = 'ORDER BY due_time'
    const minuteCard = queryNextCard(whereStr, order) as any

    // 天数级别的到期卡
    if (query.new) {
        where.push(`due_time IS NULL OR skilled = 0`)
    }
    if (query.review) {
        const dateParam = query.due_date ? `'${query.due_date}'` : ''
        where.push(`date(due_time) <= date(${dateParam})`)
    }
    if (random) {
        order = 'ORDER BY random()'
    }
    if (where.length) {
        whereStr = `where ${where.join(' AND ')}`
    }
    const dayCard = queryNextCard(whereStr, order) as any

    // 优先返回分钟级别的卡片
    if (minuteCard?.$?.total) {
        return {
            ...minuteCard,
            $: dayCard?.$
        }
    } else {
        return dayCard
    }
})