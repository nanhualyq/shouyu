export default defineEventHandler(event => {
    return db
        .prepare(`SELECT * FROM sentence 
            WHERE book_id=?
            GROUP BY lesson`)
        .all(event?.context?.params?.id)
})