export default defineEventHandler(event => {
    return db.prepare('select * from book').all()
})