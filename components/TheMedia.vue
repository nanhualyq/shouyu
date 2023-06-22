<template>
    <!-- may be video -->
    <audio :class="{loading: pending}" :src="mediaUrl" controls autoplay @loadstart="onStart" @canplaythrough="pending = false" @error="onError"></audio>
    <p v-if="error" class="text-error">{{ mediaUrl }} 加载失败!</p>
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
let pending = ref(false)
let error = ref(false)
function onStart() {
    error.value = false
    pending.value = true
}
function onError() {
    error.value = true
    pending.value = false
}
</script>