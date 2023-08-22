import fs from "fs";
import os from "os";
import { sendStream } from 'h3'
import ffmpeg from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";
import assert from "assert";
ffmpeg.setFfmpegPath(path)

interface queryObj {
    media_url?: string, media_start?: string, media_end?: string
}

export default defineEventHandler(async event => {
    const { media_url, media_start, media_end } = getQuery(event) as queryObj
    assert(media_url, 'media_url is required')
    assert(media_start, 'media_start is required')
    assert(media_end, 'media_end is required')
    const { mediaPath } = useRuntimeConfig()
    const url = mediaPath + media_url
    let temFile = `${os.tmpdir()}/${Date.now()}`
    try {
        temFile += await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(url, function (err, metadata) {
                if (err) {
                    return reject(err)
                }
                const isVideo = metadata?.streams?.some(row => row.codec_type === 'video' && !row?.disposition?.attached_pic)
                resolve(isVideo ? '.mp4' : '.mp3')
            });
        })
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
    } catch (error: any) {
        throw createError({ statusMessage: error?.message })
    }
    setTimeout(() => {
        fs.rmSync(temFile)
    }, 1000 * 10);
    return sendStream(event, fs.createReadStream(temFile))
})