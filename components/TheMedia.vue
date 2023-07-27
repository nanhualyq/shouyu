<template>
    <!-- may be video -->
    <div v-if="paramsError" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ paramsError }}</span>
    </div>
    <component :is="mediaTag" v-else ref="mediaRef" :class="{ loading: pending }" :src="mediaUrl" controls autoplay
        @loadstart="onStart" @canplaythrough="pending = false" @error="onError" />
    <p v-if="loadError" class="text-error">{{ loadError }}</p>
</template>
<script setup>
const props = defineProps({
    sentence: Object
})
const sentence = toRef(props, 'sentence')
const mediaTag = computed(() => {
    if (!sentence?.value?.media_url?.endsWith('mp3')) {
        return 'video'
    }
    return 'audio'
})
const mediaUrl = computed(() => {
    const { media_url, media_start, media_end } = sentence?.value || {}
    const search = new URLSearchParams({ media_url, media_start, media_end })
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
    pending.value = false
}
const mediaRef = ref(null)
function replay() {
    mediaRef?.value?.play()
}

defineExpose({
    replay
})
</script>