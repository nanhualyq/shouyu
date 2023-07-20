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
        <select class="select select-bordered" v-model="formData.lesson" @change="refreshSentences">
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
            @keydown.down.exact="moveFocusLine($event, 'down')">
            <thead>
                <tr>
                    <th></th>
                    <th>lesson</th>
                    <th>position</th>
                    <th>text_foreign</th>
                    <th>text_local</th>
                    <th>media_url
                        <button class="btn btn-xs" @click="handleBatchUrl">批量</button>
                    </th>
                    <th>media_start</th>
                    <th>media_end</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="sentence in sentences" @focus.capture="handleFocusTr($event, sentence)"
                    @blur.capture="handleBlurTr">
                    <th>{{ sentence.id }}</th>
                    <td v-for="field in ['lesson', 'position', 'text_foreign', 'text_local', 'media_url', 'media_start', 'media_end']"
                        :data-field="field" contenteditable>{{ sentence?.[field] }}</td>
                    <td>
                        <button class="btn btn-xs btn-error" @click="delRow">删除</button>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="6" class="text-center">
                        <button class="btn btn-primary" @click="handleSave">保存修改</button>
                    </th>
                </tr>
            </tfoot>
        </table>
        <Teleport to="body">
            <div id="time-modal" class="fixed right-2 bg-white border border-gray-500 p-2 rounded-xl text-center"
                :key="currentSentence?.id" v-if="isMediaField" :style="editorPosition">
                <TheMedia :sentence="currentSentence" />
                <div class="btn-group w-full flex gap-1 mt-2">
                    <button class="btn flex-1" @click="handleMediaTime(-1)">-1</button>
                    <button class="btn flex-1" @click="handleMediaTime(-0.1)">-0.1</button>
                    <button class="btn flex-1" @click="handleMediaTime(+0.1)">+0.1</button>
                    <button class="btn flex-1" @click="handleMediaTime(+1)">+1</button>
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
const sentencesQuery = computed(() => ({
    book_id: book?.value?.id,
    lesson: formData?.value?.lesson
}))
const { data: sentences, refresh: refreshSentences, pending } = useFetch('/api/sentence', {
    query: sentencesQuery,
    watch: false,
    immediate: false
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
}
function handleBlurTr(e) {
    if (!e.target.tagName === 'TD') {
        return
    }
    if (focusField.value) {
        currentSentence.value[focusField.value] = e.target?.textContent
    }
}
function handleMediaTime(offset) {
    let val = currentSentence.value[focusField.value]
    val = Number(val) + offset
    if (isNaN(val) || val < 0) {
        val = 0
    }
    currentSentence.value[focusField.value] = val.toFixed(2)
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
        addToast('已保存')
        refreshSentences()
    }
}
async function addRow() {
    const body = {
        ...sentencesQuery.value
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
</script>
<style scoped lang="postcss">
#focus-td {
    @apply bg-primary-content;
}
</style>