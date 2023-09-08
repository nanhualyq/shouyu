export default defineEventHandler(async event => {
    const bookIdSql = `select book_id from card 
    left join sentence on (card.sentence_id = sentence.id)
    group by book_id`
    const newTotalSql = `select count(card.id) from card 
    left join sentence on (card.sentence_id = sentence.id)
    where card.due_time IS NULL AND sentence.book_id = book.id`
    const oldTotalSql = `select count(card.id) from card 
    left join sentence on (card.sentence_id = sentence.id)
    where card.due_time NOT NULL AND sentence.book_id = book.id`
    return db.prepare(`select *, (${newTotalSql}) as new_total, (${oldTotalSql}) as old_total from book 
        where id in (${bookIdSql})
        ORDER BY new_total DESC
    `)
        .all()
})