export default defineEventHandler(async event => {
    const { book_id, lessons, position, skills } = await readBody(event)

    // sentences
    let lessonCondition = ''
    // 非全选
    if (lessons?.length) {
        lessonCondition += ` AND lesson in (${lessons.join(',')})`
    }
    if (position?.length) {
        lessonCondition += ` AND position in (${position.join(',')})`
    }
    const sentences = await db.prepare('select id from sentence where book_id=?' + lessonCondition)
        .pluck()
        .all(book_id)

    // skills
    let needSkills = skills
    // 全选
    if (!skills?.length) {
        const res = await db.prepare('select skills from book where id=?')
            .pluck()
            .get(book_id)
        needSkills = (res as String)?.split(',')
    }

    
    // cards
    const rows = []
    for (const sentence_id of sentences) {
        for (const skill of needSkills) {
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