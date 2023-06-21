<template>
    <TheLoading class="full" v-if="pending" />
    <div v-else class="h-full flex flex-col">
        <!-- front -->
        <div class="flex-1 p-2">
            <CardContext class="other-sentence"
                :query="{ book_id: book?.id, lesson: current.sentence.lesson, position: current.sentence.position - 1 }"
                label="查看上一句" :field="frontField" />

            <p class="current-sentence">
                <audio :src="mediaUrl" v-if="currentSkill === 'listen'" controls autoplay></audio>
                <span v-else class="inline-flex items-center">
                    <img v-show="currentSkill === 'speak'" src="https://www.svgrepo.com/show/316142/microphone.svg"
                        class="w-8 h-8">
                    {{ current?.sentence?.[frontField] }}
                </span>
            </p>

            <CardContext class="other-sentence"
                :query="{ book_id: book?.id, lesson: current.sentence.lesson, position: current.sentence.position + 1 }"
                label="查看下一句" :field="frontField" />
        </div>
        <div class="divider" v-if="isFlip">
            <div class="dropdown">
                <label tabindex="0" class="btn btn-xs">...</label>
                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button> 增加填空题 </button></li>
                    <li><button class="text-error"> 删除卡片 </button></li>
                </ul>
            </div>
        </div>
        <!-- back -->
        <div class="flex-1 text-primary p-2" v-if="isFlip">
            <audio src="" v-if="currentSkill === 'speak'" controls></audio>
            <span v-else>
                {{ current?.sentence?.[currentSkill === 'read' ? 'text_local' : 'text_forigen'] }}
            </span>
        </div>
        <div class="p-2 text-xs flex flex-wrap gap-4 opacity-50 justify-center">
            <p>{{ current?.$?.total }}</p>
            <p>{{ skillCn[currentSkill] }}</p>
            <p>《{{ book?.name }}》
                第{{ current?.sentence?.lesson }}课
                第{{ current?.sentence?.position }}句</p>
        </div>
        <div class="buttons flex">
            <template v-if="isFlip">
                <button v-for="(item, index) in times" @click="submitCard(index)" class="btn" :class="item.color">
                    {{ item.label }} <br> {{ formatDay(item.time) }}
                </button>
            </template>
            <button v-else @click="isFlip = true" class="btn btn-primary">显示答案</button>
        </div>
    </div>
</template>

<script setup>
const { query } = defineProps({
    query: {
        type: Object,
        default() {
            return {}
        }
    }
})
const { data: current, pending, refresh: fetchNext, error } = await useFetch('/api/card/next', { query })
if (error.value) {
    useErrorDialog(error)
}
const { data: book } = useFetch('/api/book/' + current.value?.sentence?.book_id)
const skillCn = useSkillCn()
let isFlip = ref(false)
function submitCard(index) {
    // TODO: submit patch
    fetchNext()
    isFlip.value = false
}
const currentSkill = computed(() => current?.value?.card?.skill)
const frontField = computed(() => currentSkill.value === 'write' ? 'text_local' : 'text_forigen')
const mediaUrl = computed(() => {
    const { media_url, media_start, media_end } = current?.value?.sentence || {}
    const search = new URLSearchParams({ media_url, media_start, media_end })
    return '/api/media?' + search.toString()
})
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
function formatDay(time) {
    const [, n, postfix] = time?.match(/^(\d+)(\w)/) || []
    if (postfix === 'm' || n < 30) {
        return time
    }
    let max = n / 365
    if (max >= 1) {
        return `${max.toFixed(1)}y`
    }
    max = n / 30
    if (max >= 1) {
        return `${max.toFixed(1)}mo`
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