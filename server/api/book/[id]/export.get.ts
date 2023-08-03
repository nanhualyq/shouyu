import { sendStream } from 'h3'
import fs from "fs";

export default defineEventHandler(async event => {
    const temFile = '/tmp/' + Date.now() + '.json'
    const bookId = event?.context?.params?.id
    const book = await db.prepare('select name,cover,skills from book where id=?')
        .get(bookId)
    const sentences = await db.prepare('select lesson, position, text_foreign, text_local, media_url, media_start, media_end from sentence where book_id=?')
        .all(bookId)
    const json = { book, sentences }
    fs.writeFileSync(temFile, JSON.stringify(json))
    return sendStream(event, fs.createReadStream(temFile))
})