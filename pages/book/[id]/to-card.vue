<template>
    <div class="flex flex-col h-full">
        <div class="text-sm breadcrumbs">
            <ul>
                <li>
                    <NuxtLink to="/">首页</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/book">材料</NuxtLink>
                </li>
                <li>{{ book?.name }}</li>
                <li>导入</li>
            </ul>
        </div>
        <div class="tabs flex">
            <a class="tab tab-lifted flex-1" :class="{ 'tab-active': activeTab === tabName.batch }"
                @click="activeTab = tabName.batch">批量</a>
            <a class="tab tab-lifted flex-1" :class="{ 'tab-active': activeTab === tabName.specific }"
                @click="activeTab = tabName.specific">指定</a>
        </div>
        <form v-if="activeTab === tabName.batch"
            class="flex-1 grid sm:grid-rows-[1fr_auto] grid-rows-[1fr_10rem_auto] sm:grid-cols-2 gap-4 py-2"
            @submit.prevent="submitBatch(formData)">
            <select class="select select-bordered w-full" multiple v-model="formData.lessons">
                <option disabled selected>选择课程</option>
                <option value="">全部</option>
                <option v-for="lesson in lessons" :value="lesson.lesson" class="text-ellipsis overflow-hidden">
                    {{ lesson.lesson }} {{ lesson.text_foreign }}
                </option>
            </select>
            <select class="select select-bordered w-full" multiple v-model="formData.skills">
                <option disabled selected>选择技能</option>
                <option value="">全部</option>
                <option v-for="skill in skills" :value="skill">{{ skill }}</option>
            </select>
            <button type="submit" class="btn btn-block btn-primary sm:col-span-2"
                :class="{ loading: submitting }">导入</button>
        </form>
        <form v-if="activeTab === tabName.specific" class="flex-1 flex flex-col gap-2 py-2">
            <select class="select select-bordered w-full" v-model="formData.specificLesson" @change="refreshSentences">
                <option disabled selected :value="null">选择课程</option>
                <option v-for="lesson in lessons" :value="lesson.lesson">
                    {{ lesson.lesson }} {{ lesson.text_foreign }}
                </option>
            </select>
            <div class="overflow-x-auto w-full" v-show="sentences.length">
                <table class="table w-full">
                    <!-- head -->
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>外文</th>
                            <th>译文</th>
                            <!-- TODO -->
                            <!-- <th>预览</th> -->
                            <th>导入</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in sentences" class="hover">
                            <th>{{ row.position }}</th>
                            <td>{{ row.text_foreign }}</td>
                            <td>{{ row.text_local }}</td>
                            <td>
                                <select class="select" @change="importSentence($event, row)">
                                    <option disabled selected>选择技能</option>
                                    <option value="">全部</option>
                                    <option v-for="skill in skills" :value="skill">{{ skill }}</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </form>
    </div>
</template>

<script setup>
const { params: { id } } = useRoute()
const tabName = {
    batch: Symbol(),
    specific: Symbol()
}
const activeTab = ref(tabName.batch)
const { data: book } = useFetch('/api/book/' + id)
const { data: lessons } = useFetch(`/api/book/${id}/lessons`)
const skills = computed(() => {
    return book?.value?.skills?.split(',')
})
const formData = ref({
    lessons: [''],
    skills: [''],
    specificLesson: null
})
let submitting = ref(false)
async function submitBatch(params) {
    const data = {
        book_id: book?.value?.id
    }
    for (const key of ['lessons', 'position', 'skills']) {
        if (params?.[key]?.[0] !== '') {
            data[key] = params?.[key]
        }
    }
    const { data: count, pending, error } = await useFetch('/api/card/import', {
        method: 'post',
        body: data
    })
    submitting.value = pending.value
    if (error.value) {
        useErrorDialog(error)
    } else {
        addToast(`成功：${count.value?.changes}，跳过：${count.value?.total - count.value?.changes}`)
    }
}
let sentences = ref([])
async function refreshSentences() {
    const { data } = await useFetch('/api/sentence', {
        query: {
            book_id: book?.value?.id,
            lesson: formData.value.specificLesson
        }
    })
    sentences.value = data.value
}
function importSentence(e, row) {
    submitBatch({
        lessons: [row.lesson],
        position: [row.position],
        skills: [e.target.value]
    })
    e.target.value = e.target.options[0].value 
}
</script>