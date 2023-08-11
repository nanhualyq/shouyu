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
        <button class="btn btn-primary" @click="addRow">+新增一句</button>
        <button class="btn btn-primary btn-link" onclick="sentence_shortcut_dialog.showModal()">快捷键</button>
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
            @keydown.down.exact="moveFocusLine($event, 'down')" @keydown.r.alt.exact="replay"
            @keydown.r.ctrl.alt.exact="replayEnd">
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
                        <ThePagination v-model="pageParams" :total="sentencesResult?.total" :limit="pageParams.limit" />
                        <button class="btn btn-primary ml-4" @click="handleSave">保存修改</button>
                    </th>
                </tr>
            </tfoot>
        </table>
    </div>
    <Teleport to="body">
        <div id="time-modal" class="fixed z-10 right-2 bg-white border border-gray-500 p-2 rounded-xl flex flex-col gap-2"
            v-if="isMediaField" :style="editorPosition">
            <TheMedia v-if="showMedia" ref="mediaRef" :sentence="mediaProps" />
            <div class="btn-group flex gap-1 mt-2">
                <button class="btn flex-1" @click="handleMediaTime(-1)">-1</button>
                <button class="btn flex-1" @click="handleMediaTime(-0.1)">-0.1</button>
                <button class="btn flex-1" @click="handleMediaTime(+0.1)">+0.1</button>
                <button class="btn flex-1" @click="handleMediaTime(+1)">+1</button>
            </div>
            <div class="btn-group flex gap-1 mt-2">
                <button class="btn flex-1" @click="replay">从头试播</button>
                <button class="btn flex-1" @click="replayEnd">试播末尾</button>
            </div>
        </div>
    </Teleport>
    <dialog id="sentence_shortcut_dialog" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg">键盘快捷键</h3>
            <div class="leading-10">
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">Enter</kbd>
                    保存修改
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">◀︎</kbd>
                    时间-0.1
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">▶︎</kbd>
                    时间+0.1
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">Shift</kbd>
                    +
                    <kbd class="kbd">◀︎</kbd>
                    时间-1
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">Shift</kbd>
                    +
                    <kbd class="kbd">▶︎</kbd>
                    时间+1
                </p>
                <p>
                    <kbd class="kbd">▲</kbd>
                    光标移到上一行
                </p>
                <p>
                    <kbd class="kbd">▼</kbd>
                    光标移到下一行
                </p>
                <p>
                    <kbd class="kbd">Alt</kbd>
                    +
                    <kbd class="kbd">R</kbd>
                    从头试播
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">Alt</kbd>
                    +
                    <kbd class="kbd">R</kbd>
                    试播末尾
                </p>
            </div>
        </form>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
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
const pageParams = ref({
    limit: 50,
    offset: 0
})
const sentencesQuery = computed(() => ({
    book_id: book?.value?.id,
    lesson: formData?.value?.lesson,
    limit: pageParams.value?.limit,
    offset: pageParams.value?.offset
}))
const { data: sentencesResult, refresh: refreshSentences, pending } = useFetch('/api/sentence', {
    query: sentencesQuery,
    immediate: false
})
const sentences = computed(() => sentencesResult?.value?.data)
async function handleSave() {
    syncTdData(focusTd.value)

    const { error } = await fetchWrapper(
        useFetch('/api/sentence', {
            method: 'PATCH',
            body: sentences.value,
            watch: false,
        })
    )
    if (!error.value) {
        ElNotification({
            title: '保存成功',
            type: 'success',
        })
        refreshSentences()
    }
}
onBeforeRouteLeave(() => {
    sentences.value = []
})
function handleBatchUrl() {
    ElMessageBox.prompt('', '请输入新的url')
        .then(({ value }) => {
            if (!value) {
                return
            }
            for (const row of sentences.value) {
                row.media_url = value
            }
        })
        .catch(() => { })
}
const mediaRef = ref(null)
const focusTd = ref(null)
const focusField = computed(() => focusTd.value?.dataset?.field)
const isMediaField = computed(() => ['media_start', 'media_end'].includes(focusField.value))
const editorPosition = computed(() => {
    if (!isMediaField.value) {
        return
    }
    const { bottom, top } = focusTd.value?.getBoundingClientRect()
    if (bottom > document.body.clientHeight / 2) {
        return {
            top: top + 'px',
            transform: 'translateY(-100%)'
        }
    }
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
}
function handleBlurTr(e) {
    if (!e.target.tagName === 'TD') {
        return
    }
    syncTdData(e.target)
}
function syncTdData(td) {
    if (focusField.value) {
        currentSentence.value[focusField.value] = td?.textContent
    }
}
function replay() {
    syncMediaProps()
    nextTick(() => {
        mediaRef?.value?.playStartOf()
    })
}
function replayEnd() {
    syncMediaProps()
    nextTick(() => {
        mediaRef?.value?.playStartOf(-3)
    })
}
function syncMediaProps() {
    syncTdData(focusTd.value)
    const { media_url, media_start, media_end } = currentSentence.value || {}
    mediaProps.value = {
        media_url, media_start, media_end
    }
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
    syncTdData(focusTd.value)
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
        ElNotification({
            title: '删除成功',
            type: 'success',
        })
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
        const res = await ElMessageBox.prompt('没有选择课程，请自行填入', '第几课',
            { inputValue: maxLesson + 1 })
            .catch(() => { })
        if (!res?.value) {
            return
        }
        body.lesson = +res.value
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
        ElNotification({
            title: '添加成功',
            type: 'success',
        })
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
    ElNotification({
        title: '成功',
        message: `生成：${data.value?.changes}，跳过：${data.value?.total - data.value?.changes}`,
        type: 'success',
    })
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
            ElNotification({
                title: '重置完成',
                type: 'success',
            })
            refreshSentences()
        })
}
watch(currentSentence, () => {
    mediaProps.value = {}
})
const showMedia = computed(() => {
    const vals = Object.values(mediaProps.value)
    return vals.length && vals.every(Boolean)
})
</script>
<style scoped lang="postcss">
#focus-td {
    @apply bg-primary-content;
}
</style>