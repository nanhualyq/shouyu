<template>
    <div>
        <TheMedia ref="mediaRef" v-if="current?.card?.skill === 'speak'" :sentence="current?.sentence" />
        <span id="back-text" v-else class="text-primary" v-html="backTextHtml">
        </span>
        <div class="mt-4 flex gap-2" v-show="needCloze || clozeEditing">
            <button :disabled="!needCloze" @click="submitCloze" class="btn btn-primary">{{ clozeEditing ? '修改' :
                '添加' }}填空卡片</button>
            <button class="btn" @click="cancelCloze">取消</button>
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
const mediaRef = ref(null)
const current = toRef(props, 'current')
const backTextHtml = computed(() => {
    const isRead = current?.value?.card?.skill === 'read'
    let text = current?.value?.sentence?.[isRead ? 'text_local' : 'text_foreign']
    const cloze = current?.value?.card?.cloze
    if (!cloze || clozeEditing.value) {
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
const clozeEditing = ref(false)
function handleSelection() {
    if (!props.isFlip) {
        return
    }
    needCloze.value = false
    const { anchorNode, anchorOffset, focusNode, focusOffset } = getSelection()
    // 选中的起点和终点必须在背面卡片的文本上，超出无效
    for (const node of [anchorNode, focusNode]) {
        const parent = node?.closest ? node : node?.parentNode
        if (!parent?.closest('#back-text')) {
            return
        }
    }
    // 什么都没选，无效
    if (anchorOffset === focusOffset) {
        return
    }
    // 已经是填空卡，进入修改填空模式
    if (isCloze.value) {
        clozeEditing.value = true
    }
    needCloze.value = true
}
async function submitCloze() {
    const { sentence_id, skill, id } = current?.value?.card || {}
    const { anchorOffset, focusOffset } = getSelection()
    const cloze = [anchorOffset, focusOffset]?.sort((a, b) => a - b)?.join(',')
    const body = {
        cloze
    }
    if (clozeEditing.value) {
        body.id = id
    } else {
        body.sentence_id = sentence_id
        body.skill = skill
    }
    const { data } = await fetchWrapper(useFetch('/api/card', {
        method: clozeEditing.value ? 'PATCH' : 'post',
        body
    }))
    const { changes } = data.value || {}
    if (changes === 1 || data.value === 200) {
        ElNotification({
            title: '保存成功',
            type: 'success',
        })
        if (clozeEditing.value) {
            current.value.card.cloze = cloze
        }
        cancelCloze()
    } else if (changes === 0) {
        ElNotification({
            title: '保存失败',
            message: '已存在相同的填空卡片',
            type: 'warning',
        })
    }
}
function cancelCloze() {
    getSelection()?.removeAllRanges()
    clozeEditing.value = false
}
function replay() {
    mediaRef?.value?.replay()
}
defineExpose({
    replay
})
</script>