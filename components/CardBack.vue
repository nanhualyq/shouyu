<template>
    <div>
        <TheMedia ref="mediaRef" v-if="current?.card?.skill === 'speak'" :sentence="current?.sentence" />
        <span id="back-text" v-else class="text-primary" v-html="backTextHtml">
        </span>
        <div class="mt-4">
            <button v-show="needCloze" @click="submitCloze" class="btn btn-primary btn-wide">添加填空卡片</button>
        </div>
    </div>
</template>

<script setup>
onMounted(() => {
    document.addEventListener('selectionchange', handleSelection)
})
onUnmounted(() => {
    document.removeEventListener('selectionchange', handleSelection)
})
const props = defineProps({
    current: Object,
    isFlip: Boolean
})
const current = toRef(props, 'current')
const backTextHtml = computed(() => {
    const isRead = current?.value?.card?.skill === 'read'
    let text = current?.value?.sentence?.[isRead ? 'text_local' : 'text_foreign']
    const cloze = current?.value?.card?.cloze
    if (!cloze) {
        return text
    }
    if (!/^\d+,\d+$/.test(cloze)) {
        return `cloze error: ${cloze}`
    }
    text = [...text]
    const [start, end] = cloze?.split(',')
    let str = ''
    str += text?.slice(0, start).join('')
    let clozeText = text?.slice(start, end)?.join('')
    if (!props.isFlip) {
        // const words = clozeText?.match(/\S+(?:\s+)?/gu)?.length
        // clozeText = words > 1 ? `${words} words` : '...'
        // clozeText = `[${clozeText}]`
        clozeText = `[...]`
    }
    str += `<mark>${clozeText}</mark>`
    str += text?.slice(end).join('')
    return str
})
const isCloze = computed(() => !!current?.value?.card?.cloze)
const needCloze = ref(false)
function handleSelection() {
    if (isCloze.value) {
        return
    }
    needCloze.value = false
    const { anchorNode, anchorOffset, focusNode, focusOffset } = getSelection()
    if (anchorNode !== focusNode) {
        return
    }
    if (!anchorNode?.parentNode?.closest('#back-text')) {
        return
    }
    if (anchorOffset === focusOffset) {
        return
    }
    needCloze.value = true
}
async function submitCloze() {
    const { sentence_id, skill } = current?.value?.card || {}
    const { anchorOffset, focusOffset } = getSelection()
    const cloze = [anchorOffset, focusOffset]?.sort((a, b) => a - b)?.join(',')
    const body = {
        sentence_id,
        skill,
        cloze
    }
    const { data } = await fetchWrapper(useFetch('/api/card', {
        method: 'post',
        body
    }))
    const { changes } = data.value || {}
    if (changes === 1) {
        getSelection()?.removeAllRanges()
        addToast('添加成功')
    } else if (changes === 0) {
        addToast('添加失败，重复数据', 'warning')
    }
}
</script>