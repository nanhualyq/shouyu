import db from "~/db";

export default defineEventHandler(async event => {
    return db.prepare('select count(card.id) as count,skill from card left join sentence on (card.sentence_id = sentence.id) where sentence.book_id = ? AND skilled IS NULL group by card.skill').all(getQuery(event)?.book_id)
})