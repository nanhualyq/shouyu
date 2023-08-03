export default defineEventHandler(event => {
    return db
        .prepare('select * from sentence where book_id=? AND position=1')
        .all(event?.context?.params?.id)
})