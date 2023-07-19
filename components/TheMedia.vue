<template>
    <!-- may be video -->
    <div v-if="paramsError" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ paramsError }}</span>
    </div>
    <audio v-else ref="mediaRef" :class="{ loading: pending }" :src="mediaUrl" controls autoplay @loadstart="onStart"
        @canplaythrough="pending = false" @error="onError"></audio>
    <p v-if="loadError" class="text-error">{{ mediaUrl }} 加载失败!</p>
</template>
<script setup>
const { sentence } = defineProps({
    sentence: Object
})
const mediaUrl = computed(() => {
    const { media_url, media_start, media_end } = sentence || {}
    const search = new URLSearchParams({ media_url, media_start, media_end })
    return '/api/media?' + search.toString()
})
const paramsError = computed(() => {
    for (const key of ['media_url', 'media_start', 'media_end']) {
        if (!sentence[key]) {
            return `${key} is empty`
        }
    }
    const { media_start, media_end } = sentence || {}
    if (!isFinite(media_start) || media_start < 0) {
        return 'media_start is wrong'
    }
    if (!isFinite(media_end) || media_end <= media_start) {
        return 'media_end is wrong'
    }
})
let pending = ref(false)
let loadError = ref(false)
function onStart() {
    loadError.value = false
    pending.value = true
}
function onError(e) {
    console.log(e);
    loadError.value = true
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