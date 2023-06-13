import db from "~/db";

export default defineEventHandler(async event => {
    // const booksId = await db.prepare('select book_id from card left join sentence on (card.sentence_id = sentence.id) group by book_id').pluck().all()
    const booksId = [1,2,3,4]
    return db.prepare(`select * from book where id in (${booksId.join(",")})`).all()
})