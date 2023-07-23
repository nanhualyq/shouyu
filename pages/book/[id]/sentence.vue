<template>
    <div class="text-sm breadcrumbs">
        <ul>
            <li>
                <NuxtLink to="/">首页</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/book">材料</NuxtLink>
            </li>
            <li>{{ book?.name }}</li>
            <li>管理内容</li>
        </ul>
    </div>
    <div class="flex gap-2">
        <button class="btn btn-secondary" @click="addRow">+新增一句</button>
        <select class="select select-bordered" v-model="formData.lesson">
            <option disabled selected :value="null">选择课程</option>
            <option v-for="lesson in lessons" :value="lesson.lesson">
                {{ lesson.lesson }} {{ lesson.text_foreign }}
            </option>
        </select>
    </div>
    <div class="overflow-x-auto" v-show="sentences?.length" :class="{ loading: pending }">
        <table class="table" @keydown.enter.ctrl.exact="handleSave" @keydown.left.ctrl.shift.exact="handleArrow(-1)"
            @keydown.right.ctrl.shift.exact="handleArrow(+1)" @keydown.left.ctrl.exact="handleArrow(-0.1)"
            @keydown.right.ctrl.exact="handleArrow(+0.1)" @keydown.up.exact="moveFocusLine($event, 'up')"
            @keydown.down.exact="moveFocusLine($event, 'down')" @keydown.r.alt.exact="syncMediaProps()">
            <thead>
                <tr>
                    <th></th>
                    <th>lesson</th>
                    <th>position
                        <br>
                        <button class="btn btn-xs" @click="resetPosition">本课重置</button>
                    </th>
                    <th>text_foreign</th>
                    <th>text_local</th>
                    <th>media_url
                        <br>
                        <button class="btn btn-xs" @click="handleBatchUrl">批量修改</button>
                    </th>
                    <th>media_start</th>
                    <th>media_end</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="sentence in sentences" @focus.capture="handleFocusTr($event, sentence)"
                    @blur.capture="handleBlurTr" class="hover">
                    <th>{{ sentence.id }}</th>
                    <td v-for="field in ['lesson', 'position', 'text_foreign', 'text_local', 'media_url', 'media_start', 'media_end']"
                        :data-field="field" contenteditable>{{ sentence?.[field] }}</td>
                    <td class="flex gap-2 flex-wrap">
                        <select class="select select-xs" @change="importSentence($event, sentence)">
                            <option disabled selected>生成卡片</option>
                            <option value="">全部</option>
                            <option v-for="skill in skills" :value="skill">{{ skill }}</option>
                        </select>
                        <button class="btn btn-xs btn-error" @click="delRow">删除</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="9" class="text-center">
                        <select class="select" v-if="pageCount > 1" v-model="currentPage">
                            <option v-for="page in pageCount" :value="page">第{{ page }}页</option>
                        </select>
                        <button class="btn btn-primary ml-4" @click="handleSave">保存修改</button>
                    </th>
                </tr>
            </tfoot>
        </table>
        <Teleport to="body">
            <div id="time-modal" class="fixed z-10 right-2 bg-white border border-gray-500 p-2 rounded-xl text-center"
                v-if="isMediaField" :style="editorPosition">
                <TheMedia ref="mediaRef" :key="mediaProps.key" :sentence="mediaProps" />
                <div class="btn-group w-full flex gap-1 mt-2">
                    <button class="btn flex-1" @click="handleMediaTime(-1)">-1</button>
                    <button class="btn flex-1" @click="handleMediaTime(-0.1)">-0.1</button>
                    <button class="btn flex-1" @click="handleMediaTime(+0.1)">+0.1</button>
                    <button class="btn flex-1" @click="handleMediaTime(+1)">+1</button>
                    <button class="btn" @click="syncMediaProps">重试</button>
                </div>
            </div>
        </Teleport>
    </div>
</template>
<script setup>
const { params: { id } } = useRoute()
const { data: book } = useFetch('/api/book/' + id)
const { data: lessons, refresh: refreshLessons } = useFetch(`/api/book/${id}/lessons`)
const formData = ref({
    lesson: null
})
let currentSentence = ref({})
const mediaProps = ref({})
const limit = 50
const currentPage = ref(1)
const sentencesQuery = computed(() => ({
    book_id: book?.value?.id,
    lesson: formData?.value?.lesson,
    limit,
    offset: (currentPage.value - 1) * limit
}))
const { data: sentencesResult, refresh: refreshSentences, pending } = useFetch('/api/sentence', {
    query: sentencesQuery,
    immediate: false
})
const sentences = computed(() => sentencesResult?.value?.data)
const pageCount = computed(() => {
    return Math.ceil(sentencesResult?.value?.total / 50) || 0
})
async function handleSave() {
    const { error } = await fetchWrapper(
        useFetch('/api/sentence', {
            method: 'PATCH',
            body: sentences.value,
            watch: false,
        })
    )
    if (!error.value) {
        addToast('已保存')
        refreshSentences()
    }
}
onBeforeRouteLeave(() => {
    sentences.value = []
})
function handleBatchUrl() {
    const val = prompt('新的url')
    if (val === null) {
        return
    }
    for (const row of sentences.value) {
        row.media_url = val
    }
}
const mediaRef = ref(null)
const focusTd = ref(null)
const focusField = computed(() => focusTd.value?.dataset?.field)
const isMediaField = computed(() => ['media_start', 'media_end'].includes(focusField.value))
const editorPosition = computed(() => {
    const { bottom } = focusTd.value?.getBoundingClientRect()
    return {
        top: bottom + 'px'
    }
})
onMounted(() => {
    window.addEventListener('focus', handleFocusBound, true)
    window.addEventListener('click', handleFocusBound, true)
})
onUnmounted(() => {
    window.removeEventListener('focus', handleFocusBound, true)
    window.removeEventListener('click', handleFocusBound, true)
})
let timeout
function handleFocusBound() {
    if (timeout) {
        clearTimeout(timeout)
    }
    timeout = setTimeout(() => handleFocus(...arguments), 100)
}
function handleFocus(e) {
    if (e?.target?.closest?.('#focus-td') || e?.target?.closest?.('#time-modal')) {
        return
    }
    document.getElementById('focus-td')?.removeAttribute('id')
    focusTd.value = null
    currentSentence.value = null
}
function handleFocusTr(e, sentence) {
    if (!e.target.tagName === 'TD') {
        return
    }
    document.getElementById('focus-td')?.removeAttribute('id')
    e.target.id = 'focus-td'
    focusTd.value = e.target
    currentSentence.value = sentence
    syncMediaProps()
}
function handleBlurTr(e) {
    if (!e.target.tagName === 'TD') {
        return
    }
    if (focusField.value) {
        currentSentence.value[focusField.value] = e.target?.textContent
    }
}
function syncMediaProps() {
    const { media_url, media_start, media_end } = currentSentence.value || {}
    mediaProps.value = {
        key: media_url + media_start + media_end,
        media_url, media_start, media_end
    }
    mediaRef?.value?.replay()
}

function time2Seconds(h, m, s) {
    let seconds = +s
    if (m > 0) {
        seconds += m * 60
    }
    if (h > 0) {
        seconds += h * 60 ** 2
    }
    return seconds
}
function seconds2Time(seconds) {
    let rest = +seconds
    const arr = []
    for (let i = 2; i >= 0; i--) {
        const base = 60 ** i
        let res = Math.floor(rest / base)
        rest -= res * base
        arr.push(String(res).padStart('2', '0'))
    }
    const decimal = String(rest)?.match(/(?:^\d+)?(.\d{1,3})/)?.[1]
    return arr.join(':') + decimal
}
function handleMediaTime(offset) {
    let val = currentSentence.value[focusField.value]
    const { h, m, s } = String(val || '')
        ?.match(/^(?:(?:(?<h>\d{2}):)?(?<m>\d{2}):)?(?<s>\d{2}(?:\.\d+)?)$/)
        ?.groups || {}
    val = time2Seconds(h, m, s || val) + offset
    if (isNaN(val) || val < 0) {
        val = 0
    }
    const isComplex = !!m
    currentSentence.value[focusField.value] = isComplex ? seconds2Time(val) : val.toFixed(2)
}
function handleArrow(offset) {
    if (!isMediaField.value) {
        return
    }
    handleMediaTime(offset)
}
function moveFocusLine(e, direction) {
    if (!e.target.tagName === 'TD') {
        return
    }
    const key = direction === 'up' ? 'previousElementSibling' : 'nextElementSibling'
    const sibling = e.target.closest('tr')?.[key]
    if (sibling) {
        sibling?.querySelector(`td[data-field="${focusField.value}"]`)?.focus()
    }
}
async function delRow() {
    if (!confirm('将删除所有关联的卡片，确认？')) {
        return
    }
    const { error } = await fetchWrapper(
        useFetch('/api/sentence/' + currentSentence.value.id, {
            method: 'DELETE',
            watch: false,
        })
    )
    if (!error.value) {
        addToast('删除成功')
        refreshSentences()
    }
}
async function addRow() {
    const { book_id, lesson } = sentencesQuery.value || {}
    const body = {
        book_id, lesson
    }
    // 课程是手动输入的话，完成后要自动选中该课程
    let lessonInputed = false
    if (body.lesson == null) {
        const maxLesson = lessons.value?.[lessons.value?.length - 1]?.lesson || 0
        let val = prompt('没有选择课程，请自行填入', maxLesson + 1)
        if (val === null) {
            return
        }
        body.lesson = +val
        lessonInputed = true
    }
    body.position = (sentences.value?.[sentences.value?.length - 1]?.position || 0) + 1
    body.text_foreign = ''
    body.text_local = ''
    const { error } = await fetchWrapper(
        useFetch('/api/sentence/', {
            method: 'post',
            body
        })
    )
    if (!error.value) {
        addToast('添加成功')
        if (lessonInputed) {
            await refreshLessons()
            formData.value.lesson = body.lesson
        }
        refreshSentences()
    }
}
const skills = computed(() => {
    return book?.value?.skills?.split(',')
})
async function importSentence(e, row) {
    const body = {
        book_id: book?.value?.id,
        lessons: [row.lesson],
        position: [row.position]
    }
    if (e.target.value) {
        body.skills = [e.target.value]
    }
    const { data } = await fetchWrapper(
        useFetch('/api/card/import', {
            method: 'post',
            body
        })
    )
    addToast(`成功：${data.value?.changes}，跳过：${data.value?.total - data.value?.changes}`)
    e.target.value = e.target.options[0].value
}
function resetPosition() {
    const { book_id, lesson } = sentencesQuery.value
    fetchWrapper(
        useFetch(`/api/sentence/reset-position`, {
            method: 'PATCH',
            body: {
                book_id, lesson
            }
        })
    )
    .then(() => {
        addToast('重置完成')
        refreshSentences()
    })
}
</script>
<style scoped lang="postcss">
#focus-td {
    @apply bg-primary-content;
}
</style>