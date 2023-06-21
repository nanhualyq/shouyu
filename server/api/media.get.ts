import fs from "fs";
import { sendStream } from 'h3'
import ffmpeg from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(path)

export default defineEventHandler(async event => {
    const { media_url, media_start, media_end } = getQuery(event)
    const url = '/app/media' + media_url
    const temFile = '/tmp/' + Date.now() + '.mp3'
    await new Promise((resolve, reject) => {
        ffmpeg(url)
            .seekInput(String(media_start))
            .duration(Number(media_end) - Number(media_start))
            // .pipe(outStream, { end: true })
            .output(temFile)
            .on('end', resolve)
            .on('error', reject)
            .run()
    })
    setTimeout(() => {
        fs.rmSync(temFile)
    }, 1000 * 10);
    return sendStream(event, fs.createReadStream(temFile))
})