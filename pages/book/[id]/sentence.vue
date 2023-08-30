<template>
    <div class="flex-1 flex flex-col" v-loading="pending">
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
        <div class="flex gap-2 mb-2">
            <button class="btn btn-primary" @click="handleSave">保存修改</button>
            <button class="btn btn-primary btn-link" onclick="sentence_shortcut_dialog.showModal()">快捷键</button>
            <select class="select select-bordered" v-model="lesson">
                <option disabled selected :value="null">选择课程</option>
                <option v-for="lesson in lessons" :value="lesson.lesson">
                    {{ lesson.lesson }} {{ lesson.text_foreign }}
                </option> 
            </select>
        </div>
        <ClientOnly>
            <MyHotTable ref="myHotRef" :data="sentences" :rowHeaders="true" :colHeaders="colHeaders"
                :columns="columns" :hiddenColumns="hiddenColumns" :contextMenu="contextMenu"
                :afterCreateRow="afterCreateRow" :beforeRemoveRow="beforeRemoveRow" :afterRemoveRow="afterRemoveRow" currentRowClassName="current-row" />
            <el-dialog :model-value="!!mediaProps?.id" title="预览" @close="mediaProps = null">
                <h2 class="mb-4">{{ mediaProps?.text_foreign }}</h2>
                <TheMedia v-if="mediaProps" ref="mediaRef" :sentence="mediaProps" />
            </el-dialog>
        </ClientOnly>
    </div>
    <dialog id="sentence_shortcut_dialog" class="modal">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg">键盘快捷键</h3>
            <div class="leading-10">
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">S</kbd>
                    保存修改
                </p>
                <hr>
                （聚焦在媒体时间单元格时）
                <p>
                    <kbd class="kbd">Alt</kbd>
                    +
                    <kbd class="kbd">▼</kbd>
                    时间-0.1
                </p>
                <p>
                    <kbd class="kbd">Alt</kbd>
                    +
                    <kbd class="kbd">▲</kbd>
                    时间+0.1
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">Alt</kbd>
                    +
                    <kbd class="kbd">▼</kbd>
                    时间-1
                </p>
                <p>
                    <kbd class="kbd">Ctrl</kbd>
                    +
                    <kbd class="kbd">Alt</kbd>
                    +
                    <kbd class="kbd">▲</kbd>
                    时间+1
                </p>
                <p>
                    <kbd class="kbd">Space</kbd>
                    从头试播（media_start）
                </p>
                <p>
                    <kbd class="kbd">Space</kbd>
                    试播末尾（media_end）
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
const { data: book } = await useFetch('/api/book/' + id)
const { data: lessons, refresh: refreshLessons } = useFetch(`/api/book/${id}/lessons`)
const skills = computed(() => {
    return book?.value?.skills?.split(',')
})
const lesson = ref()
const mediaProps = ref({})
const { data: sentencesResult, refresh: refreshSentences, pending } = useFetch('/api/sentence', {
    query: {
        book_id: id,
        lesson
    },
    immediate: false
})
if (!lesson.value) {
    pending.value = false
    sentencesResult.value = {}
}
const sentences = computed(() => {
    const data = sentencesResult?.value?.data
    if (data?.length > 0) {
        return data
    }
    return [{ book_id: id }]
})
const myHotRef = ref(null)
function getHot() {
    return myHotRef.value.hotRef.hotInstance
}
let deleteIds = new Set()
watch(sentencesResult, () => {
    deleteIds = new Set()
    getHot().loadData(sentences.value)
})
const colHeaders = ['id', 'book_id', 'lesson', 'position', 'text_foreign', 'text_local', 'media_url', 'media_start', 'media_end']
const columns = colHeaders.map(data => ({ data, readOnly: data === 'id' }))
const hiddenColumns = {
    columns: [1],
    indicators: false,
}
const contextMenu = {
    callback(key, selection, clickEvent) {
        if (key.startsWith('card:')) {
            importSentence(key, selection)
        }
    },
    items: {
        row_above: {},
        row_below: {},
        remove_row: {},
        clear_column: {},
        undo: {},
        redo: {},
        cut: {},
        copy: {},
        card: {
            name: 'Generate card',
            submenu: {
                items: [
                    { key: 'card:all', name: 'all' },
                    ...(skills.value || []).map(name => ({ key: `card:${name}`, name }))
                ]
            }
        }
    }
}
function afterCreateRow(index) {
    getHot().setDataAtRowProp(index, 'book_id', book?.value?.id)
    if ([lesson.value]) {
        getHot().setDataAtRowProp(index, 'lesson', [lesson.value])
    }
    resetPosition()
}
function beforeRemoveRow(index, total, indexArr) {
    for (const i of indexArr) {
        const id = getHot().getDataAtRowProp(i, 'id')
        if (id) {
            deleteIds.add(id)
        }
    }
}
function afterRemoveRow() {
    resetPosition()
}
function handleKeydown(e) {
    // console.log(e);
    if (e.key === 's' && e.ctrlKey) {
        handleSave()
        e.preventDefault()
        return
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        handleMediaTime(e)
        return
    }
    if (e.key === ' ') {
        handlePreview(e)
        return
    }
}
const mediaRef = ref(null)
function handlePreview(keyEvent) {
    const { row, prop } = getHot()?.getActiveEditor() || {}
    if (!['media_start', 'media_end'].includes(prop)) {
        return
    }
    mediaProps.value = getHot().getSourceDataAtRow(row)
    if (prop === 'media_end') {
        nextTick(() => {
            mediaRef?.value?.playStartOf(-3)
        })
    }
    keyEvent.preventDefault()
    keyEvent.stopPropagation()
}
async function handleSave() {
    await handleDeleteRows()
    const { error } = await fetchWrapper(
        useFetch('/api/sentence', {
            method: 'post',
            body: getHot().getSourceData()
        })
    )
    if (!error.value) {
        ElNotification({
            title: '保存成功',
            type: 'success',
        })
        refreshSentences()
        refreshLessons()
    }
}
function handleDeleteRows() {
    const tableIds = new Set(getHot().getDataAtProp('id'))
    const removeIds = Array.from(deleteIds)
        .filter(id => !tableIds.has(id))
    if (removeIds.length === 0) {
        return
    }
    fetchWrapper(
        useFetch('/api/sentence', {
            method: 'delete',
            body: removeIds
        })
    )
}
onMounted(() => {
    window.addEventListener('keydown', handleKeydown, true)
})
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown, true)
})
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
function handleMediaTime(keyEvent) {
    if (!keyEvent.altKey) {
        return
    }
    const { row, prop } = getHot().getActiveEditor()
    if (!['media_start', 'media_end'].includes(prop)) {
        return
    }
    let val = getHot().getDataAtRowProp(row, prop)
    let offset = keyEvent.ctrlKey ? 1 : 0.1
    if (keyEvent.key === 'ArrowDown') {
        offset = -offset
    }
    const { h, m, s } = String(val || '')
        ?.match(/^(?:(?:(?<h>\d{2}):)?(?<m>\d{2}):)?(?<s>\d{2}(?:\.\d+)?)$/)
        ?.groups || {}
    val = time2Seconds(h, m, s || val) + offset
    if (isNaN(val) || val < 0) {
        val = 0
    }
    const isComplex = !!m
    const newVal = isComplex ? seconds2Time(val) : val.toFixed(2)
    getHot().setDataAtRowProp(row, prop, newVal)
    keyEvent.preventDefault()
}
async function importSentence(action, selections) {
    const body = {
        sentences: [],
        skills: skills.value
    }
    const skill = action.replace(/^card:/, '')
    if (skill !== 'all') {
        body.skills = [skill]
    }
    for (const part of selections) {
        for (let i = part.start.row; i <= part.end.row; i++) {
            const id = getHot().getDataAtRowProp(i, 'id')
            if (id) {
                body.sentences.push(id)
            }
        }
    }
    if (body.sentences.length === 0) {
        return
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
}
async function resetPosition(start = 0) {
    const length = getHot().getData().length
    const end = Math.min(start + 10, length)
    await new Promise((resolve) => {
        setTimeout(() => {
            for (let i = start; i < end; i++) {
                getHot().setDataAtRowProp(i, 'position', i + 1)
            }
            resolve()
        }, 0);
    })
    if (end < length) {
        resetPosition(end)
    }
}
</script>
<style scoped lang="postcss">
:deep(.current-row) {
    @apply bg-primary-content;
}
</style>