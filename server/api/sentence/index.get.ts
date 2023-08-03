export default defineEventHandler(event => {
    const query = getQuery(event)
    let where = Object.entries(query)
        .filter(([key]) => !['limit', 'offset'].includes(key))
        .map(([key, val]) => `${key}=@${key}`)
        .join(' AND ')
    if (!query.limit) {
        query.limit = -1
    }
    if (!query.offset) {
        query.offset = 0
    }
    if (where) {
        where = `WHERE ${where}`
    }
    const data = db.prepare(`select * from sentence ${where}
    limit @limit
    offset @offset`)
        .all(query)
    const total = db.prepare(`select count(id) as total from sentence ${where}`)
        .pluck()
        .get(query)
    return {
        data,
        total
    }
})