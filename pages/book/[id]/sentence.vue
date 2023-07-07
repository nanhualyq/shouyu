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
    <select class="select select-bordered w-full" v-model="formData.lesson" @change="refreshSentences">
        <option disabled selected :value="null">选择课程</option>
        <option v-for="lesson in lessons" :value="lesson.lesson">
            {{ lesson.lesson }} {{ lesson.text_forigen }}
        </option>
    </select>
    <div class="overflow-x-auto" v-show="sentences?.length" :class="{loading: pending}">
        <table class="table">
            <thead>
                <tr>
                    <!-- <th></th> -->
                    <th>position</th>
                    <th>text_forigen</th>
                    <th>text_local</th>
                    <th>media_url
                        <button class="btn btn-xs" @click="handleBatchUrl">批量</button>
                    </th>
                    <th>media_start</th>
                    <th>media_end</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="sentence in sentences">
                    <!-- <th>{{sentence.id}}</th> -->
                    <td contenteditable @blur="sentence.position = $event?.target?.textContent">{{ sentence.position }}</td>
                    <td contenteditable @blur="sentence.text_forigen = $event?.target?.textContent">{{ sentence.text_forigen
                    }}</td>
                    <td contenteditable @blur="sentence.text_local = $event?.target?.textContent">{{ sentence.text_local }}
                    </td>
                    <td contenteditable @blur="sentence.media_url = $event?.target?.textContent">{{ sentence.media_url }}
                    </td>
                    <!-- TODO modal control panel -->
                    <td contenteditable @blur="sentence.media_start = $event?.target?.textContent">{{ sentence.media_start
                    }}</td>
                    <td contenteditable @blur="sentence.media_end = $event?.target?.textContent">{{ sentence.media_end }}
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
    </div>
</template>
<script setup>
const { params: { id } } = useRoute()
const { data: book } = useFetch('/api/book/' + id)
const { data: lessons } = useFetch(`/api/book/${id}/lessons`)
const formData = ref({
    lesson: null
})
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
    const {error} = await fetchWrapper(
        useFetch('/api/sentence', {
            method: 'PATCH',
            body: sentences.value
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
</script>