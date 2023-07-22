import fs from "fs";
import { sendStream } from 'h3'
import ffmpeg from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(path)

export default defineEventHandler(async event => {
    const { media_url, media_start, media_end } = getQuery(event)
    const [, postfix] = String(media_url)?.match(/(\.\w+)$/) || []
    const { mediaPath } = useRuntimeConfig()
    const url = mediaPath + media_url
    const temFile = '/tmp/' + Date.now() + postfix
    try {
        await new Promise((resolve, reject) => {
            ffmpeg(url)
                .inputOptions([
                    `-ss ${media_start}`,
                    `-to ${media_end}`
                ])
                .size('640x?')
                .output(temFile)
                .on('end', resolve)
                .on('error', reject)
                .run()
        })
    } catch (error) {
        throw createError({ statusMessage: error?.message })
    }
    setTimeout(() => {
        fs.rmSync(temFile)
    }, 1000 * 10);
    return sendStream(event, fs.createReadStream(temFile))
})