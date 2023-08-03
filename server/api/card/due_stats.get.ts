export default defineEventHandler(async event => {
    return db.prepare(`SELECT 
            count(id) as count, 
            iif(date(due_time) <= date(), date(), date(due_time)) as date 
            FROM card
            WHERE due_time > 0
            GROUP BY date
            ORDER BY date ASC
            LIMIT 7`)
        .all()
})