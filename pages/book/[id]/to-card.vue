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
                <li>生成卡片</li>
            </ul>
        </div>
        <form class="flex-1 grid sm:grid-rows-[1fr_auto] grid-rows-[1fr_10rem_auto] sm:grid-cols-2 gap-4 py-2"
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
            <button type="submit" class="btn btn-block btn-primary sm:col-span-2">开始生成</button>
        </form>
    </div>
</template>

<script setup>
const { params: { id } } = useRoute()
const { data: book } = useFetch('/api/book/' + id)
const { data: lessons } = useFetch(`/api/book/${id}/lessons`)
const skills = computed(() => {
    return book?.value?.skills?.split(',')
})
const formData = ref({
    lessons: [''],
    skills: ['']
})
async function submitBatch(params) {
    const data = {
        book_id: book?.value?.id
    }
    for (const key of ['lessons', 'position', 'skills']) {
        if (params?.[key]?.[0] !== '') {
            data[key] = params?.[key]
        }
    }
    const { data: count, error } = await fetchWrapper(
        useFetch('/api/card/import', {
            method: 'post',
            body: data
        })
    )
    if (!error.value) {
        ElNotification({
            title: '成功',
            message: `生成：${count.value?.changes}，跳过：${count.value?.total - count.value?.changes}`,
            type: 'success',
        })
    }
}
</script>