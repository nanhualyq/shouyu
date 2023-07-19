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
        <div class="divider" v-if="isFlip"> </div>
        <!-- back -->
        <div class="flex-1 text-primary p-2" v-if="isFlip">
            <TheMedia ref="mediaRef" v-if="currentSkill === 'speak'" :sentence="current?.sentence" />
            <span v-else>
                {{ current?.sentence?.[currentSkill === 'read' ? 'text_local' : 'text_foreign'] }}
            </span>
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
                    <li><button class="btn btn-link link-neutral">填空</button></li>
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
const book = ref({name: '123'})
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
}
const mediaRef = ref(null)
function replayMedia() {
    mediaRef?.value?.replay()
}
onMounted(() => window.addEventListener('keyup', handleKeyup))
onUnmounted(() => window.removeEventListener('keyup', handleKeyup))
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