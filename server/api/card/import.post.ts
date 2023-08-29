async function getSentencesByBook(body: any) {
    const { book_id, lessons, position } = body
    let lessonCondition = ''
    // 非全选
    if (lessons?.length) {
        lessonCondition += ` AND lesson in (${lessons.join(',')})`
    }
    if (position?.length) {
        lessonCondition += ` AND position in (${position.join(',')})`
    }
    return db.prepare('select id from sentence where book_id=?' + lessonCondition)
        .pluck()
        .all(book_id)
}

export default defineEventHandler(async event => {
    const body = await readBody(event)

    let { sentences, skills, book_id } = body
    if (!Array.isArray(sentences)) {
        sentences = await getSentencesByBook(body)
    }

    // skills
    // 全选
    if (!skills?.length && book_id) {
        const res = await db.prepare('select skills from book where id=?')
            .pluck()
            .get(book_id)
        skills = (res as String)?.split(',')
    }

    // cards
    const rows = []
    for (const sentence_id of sentences) {
        for (const skill of skills) {
            rows.push(`(${sentence_id},'${skill}')`)
        }
    }
    const res = await db.prepare('insert into card (sentence_id,skill) values' + rows.join(','))
        .run()
    return {
        total: rows.length,
        ...res
    }
})