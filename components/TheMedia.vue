<template>
    <!-- may be video -->
    <div v-if="paramsError" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ paramsError }}</span>
    </div>
    <component :is="mediaTag" v-else ref="mediaRef" :class="{ loading: pending }" :src="mediaUrl" controls
        :autoplay="autoplay" @loadstart="onStart" @canplay="pending = false" @error="onError"
        @canplaythrough="onCanplaythrough" />
    <p v-if="loadError" class="text-error">{{ loadError }}</p>
</template>
<script setup>
const props = defineProps({
    sentence: Object,
    autoplay: {
        type: Boolean,
        default: true
    }
})
const sentence = toRef(props, 'sentence')
const mediaTag = computed(() => {
    return isVideoUrl(sentence?.value?.media_url) ? 'video' : 'audio'
})
const mediaUrl = computed(() => {
    const { media_url, media_start, media_end } = sentence?.value || {}
    const search = new URLSearchParams({
        media_url,
        media_start: startPriority.value || media_start,
        media_end
    })
    return '/api/media?' + search.toString()
})
const paramsError = computed(() => {
    for (const key of ['media_url', 'media_start', 'media_end']) {
        if (!sentence?.value[key]) {
            return `${key} is empty`
        }
    }
})
let pending = ref(false)
let loadError = ref(false)
function onStart() {
    loadError.value = ''
    pending.value = true
}
function onError(e) {
    loadError.value = mediaRef?.value?.error?.message
    // fix: chrome error when exec play()
    if (loadError.value === 'PIPELINE_ERROR_READ: FFmpegDemuxer: demuxer seek failed') {
        mediaRef?.value?.load()
    }
    pending.value = false
}
function onCanplaythrough(e) {
    if (nextPlayFn) {
        nextPlayFn()
    }
}
const mediaRef = ref(null)
function replay() {
    const node = mediaRef?.value
    if (!node?.duration) {
        return
    }
    if (node?.currentTime > 0) {
        node.currentTime = 0
    }
    node?.play()
}
let nextPlayFn = null
const startPriority = ref()
function playStartOf(start) {
    const node = mediaRef?.value
    startPriority.value = null
    nextPlayFn = function () {
        if (!start) {
            replay()
        } else {
            // fix: chrome set currentTime not working
            if (window.chrome) {
                const { media_start, media_end } = sentence?.value || {}
                const startTime = (start < 0 ? Number(media_end) : Number(media_start)) + start
                startPriority.value = Math.max(media_start, startTime)
                mediaRef?.value?.load()
            } else {
                const startTime = (start < 0 ? node.duration : node.currentTime) + start
                node.currentTime = Math.max(0, startTime)
                node?.play()
            }
        }
        nextPlayFn = null
    }
    if (node.duration) {
        nextPlayFn()
    }
}

defineExpose({
    replay,
    playStartOf
})
</script>