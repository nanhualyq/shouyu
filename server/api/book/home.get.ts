export default defineEventHandler(async event => {
    const bookIdSql = `select book_id from card 
    left join sentence on (card.sentence_id = sentence.id)
    group by book_id`
    const countSql = `select count(card.id) from card 
    left join sentence on (card.sentence_id = sentence.id)
    where card.due_time IS NULL AND sentence.book_id = book.id`
    return db.prepare(`select *, (${countSql}) as new_total from book 
        where id in (${bookIdSql})
        ORDER BY new_total DESC
    `)
        .all()
})