<template>
    <TheLoading class="full" v-if="pending" />
    <div v-else-if="!current?.card?.id" class="text-center mt-4">
        <h2>没有内容了</h2>
        <NuxtLink class="btn btn-primary btn-wide mt-2" to="/">返回</NuxtLink>
    </div>
    <div v-else class="h-full flex flex-col">
        <!-- front -->
        <div class="flex-1 p-2">
            <CardContext class="other-sentence"
                :query="{ book_id: book?.id, lesson: current.sentence.lesson, position: current.sentence.position - 1 }"
                label="查看上一句" :field="frontField" />

            <p class="current-sentence">
                <TheMedia ref="mediaRef" v-if="currentSkill === 'listen'" :sentence="current?.sentence" />
                <span v-else class="inline-flex items-center">
                    <img :src="`https://www.svgrepo.com/show/${currentSkill === 'speak' ? '316142/microphone.svg' : '519845/translate-you.svg'}`"
                        class="w-8 h-8">
                    {{ current?.sentence?.[frontField] }}
                </span>
            </p>

            <CardContext class="other-sentence"
                :query="{ book_id: book?.id, lesson: current.sentence.lesson, position: current.sentence.position + 1 }"
                label="查看下一句" :field="frontField" />
        </div>
        <div class="divider" v-if="isFlip || isCloze"></div>
        <!-- back -->
        <div class="flex-1 p-2" v-if="isFlip || isCloze">
            <TheMedia ref="mediaRef" v-if="currentSkill === 'speak'" :sentence="current?.sentence" />
            <span id="back-text" v-else class="text-primary" v-html="backTextHtml">
            </span>
            <div class="mt-4">
                <button v-show="needCloze" @click="submitCloze" class="btn btn-primary btn-wide">添加填空卡片</button>
            </div>
        </div>
        <div class="p-2 text-xs flex flex-wrap gap-4 opacity-50 justify-center items-center">
            <p>{{ current?.$?.total }}</p>
            <p>{{ skillCn[currentSkill] }}</p>
            <p>《{{ book?.name }}》
                第{{ current?.sentence?.lesson }}课
                第{{ current?.sentence?.position }}句</p>
            <div class="relative group">
                <button class="btn btn-link btn-xs link-neutral">其他操作</button>
                <ul class="group-hover:block absolute right-5 bottom-5 bg-gray-100 border shadow p-2 rounded w-max hidden">
                    <li><button @click="handleDelete" class="btn btn-link link-error">删除</button></li>
                </ul>
            </div>
        </div>
        <div class="buttons flex">
            <template v-if="isFlip">
                <button v-for="(item, index) in times" @click="submitCard(index)" class="btn" :class="item.color">
                    {{ item.label }} <br> {{ formatDay(item.time) }}
                </button>
            </template>
            <button v-else @click="showAnswer" class="btn btn-primary">显示答案</button>
        </div>
    </div>
</template>

<script setup>
const { query, isPreview } = defineProps({
    query: {
        type: Object,
        default() {
            return {}
        }
    },
    isPreview: Boolean
})
const { data: current, pending, refresh: fetchNext, error } = await useFetch('/api/card/next', { query })
if (error.value) {
    useErrorDialog(error)
}
const book = ref({})
const bookId = current.value?.sentence?.book_id
if (bookId) {
    useFetch('/api/book/' + bookId)
        .then(res => book.value = res?.data?.value)
}
const skillCn = useSkillCn()
let isFlip = ref(false)
async function submitCard(index) {
    if (!isFlip.value || isPreview) {
        return
    }
    const { time } = times.value?.[index] || {}
    if (!time) {
        return
    }
    const { num, postfix } = parseTime(time)
    const sqlitePostfix = postfix === 'm' ? 'minutes' : 'days'
    const { id } = current?.value?.card
    pending.value = true
    const { error } = await useFetch(`/api/card/${id}`, {
        method: 'PATCH',
        body: {
            due_time: `+${num} ${sqlitePostfix}`,
            skilled: postfix === 'm' ? 0 : num
        }
    })
        .finally(() => pending.value = false)
    if (error.value) {
        useErrorDialog(error)
        return
    }
    doNext()
}
function doNext() {
    fetchNext()
    isFlip.value = false
}
const currentSkill = computed(() => current?.value?.card?.skill)
const frontField = computed(() => currentSkill.value === 'write' ? 'text_local' : 'text_foreign')
const times = computed(() => {
    const last = current?.value?.card?.skilled || 0
    const arr = [
        { time: '', color: 'btn-error', label: '遗忘' },
        {
            time: '', color: 'btn-warning', label: '模糊'
        }, { time: '', color: 'btn-success', label: '记得' },
        {
            time: '', color: 'btn-info', label: '容易'
        }
    ]
    arr[0].time = calcFirstTime(last)
    arr[1].time = last ? `${last}d` : '5m'
    arr[2].time = `${Math.ceil(last * 2.5) || 1}`
    arr[3].time = `${Math.ceil(arr[2].time * 2.5) || 4}d`
    arr[2].time += 'd'
    return arr
})
function calcFirstTime(day) {
    if (day === 0) {
        return '1m'
    } else if (day === 1) {
        return '5m'
    } else {
        return '1d'
    }
}
function parseTime(str) {
    const [, num, postfix] = str?.match(/^(\d+)(\w)/) || []
    return { num, postfix }
}
function formatDay(time) {
    const { num, postfix } = parseTime(time)
    if (postfix === 'm' || num < 30) {
        return time
    }
    let max = num / 365
    if (max >= 1) {
        return `${max.toFixed(1)}y`
    }
    max = num / 30
    if (max >= 1) {
        return `${max.toFixed(1)}mo`
    }
}
async function handleDelete() {
    if (!confirm('确认删除？')) {
        return
    }
    pending.value = true
    const { error } = await useFetch('/api/card/' + current?.value?.card?.id, {
        method: 'delete'
    })
        .finally(() => pending.value = false)
    if (error.value) {
        useErrorDialog(error)
        return
    }
    doNext()
}
function showAnswer() {
    isFlip.value = true
    if (isCloze.value) {
        current.value.card.cloze = ''
    }
}
const mediaRef = ref(null)
function replayMedia() {
    mediaRef?.value?.replay()
}
onMounted(() => {
    window.addEventListener('keyup', handleKeyup)
    document.addEventListener('selectionchange', handleSelection)
})
onUnmounted(() => {
    window.removeEventListener('keyup', handleKeyup)
    document.removeEventListener('selectionchange', handleSelection)
})
function handleKeyup(e) {
    switch (e.code) {
        case 'Space':
            showAnswer()
            break;
        case 'Delete':
            handleDelete()
            break;
        case 'KeyR':
            replayMedia()
            break;

        default:
            const [, num] = e?.code?.match(/(?:Digit|Numpad)(\d)$/) || []
            if (num) {
                submitCard(num - 1)
            }
            break;
    }
}
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
const isCloze = computed(() => !!current?.value?.card?.cloze)
const backTextHtml = computed(() => {
    const isRead = currentSkill.value === 'read'
    const text = current?.value?.sentence?.[isRead ? 'text_local' : 'text_foreign']
    const cloze = current?.value?.card?.cloze
    if (!cloze) {
        return text
    }
    if (!/^\d+,\d+$/.test(cloze)) {
        return `cloze error: ${cloze}`
    }
    const [start, end] = cloze?.split(',')
    let str = ''
    str += text?.slice(0, start)
    str += `<mark>[...]</mark>`
    str += text?.slice(end)
    return str
})
</script>

<style scoped lang="postcss">
.other-sentence {
    @apply opacity-30;
}

.current-sentence {
    @apply my-2;
}

.buttons button {
    @apply flex-1 rounded-none normal-case animate-none;
}
</style>