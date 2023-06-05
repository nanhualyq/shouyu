<template>
    <div class="flex flex-col h-full">
        <div class="text-sm breadcrumbs">
            <ul>
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
        <div v-if="activeTab === tabName.batch" class="flex-1">
            <form class="flex gap-4 py-2 flex-wrap h-full" @submit.prevent="submitBatch">
                <!-- TODO: use checkbox instead -->
                <select class="select select-bordered w-full sm:flex-1 h-48" multiple v-model="formData.lessons">
                    <option disabled selected>选择课程</option>
                    <option value="">全部</option>
                    <option v-for="lesson in lessons" :value="lesson">{{ lesson }}</option>
                </select>
                <select class="select select-bordered w-full sm:flex-1" multiple v-model="formData.skills">
                    <option disabled selected>选择技能</option>
                    <option value="">全部</option>
                    <option v-for="skill in skills" :value="skill">{{ skill }}</option>
                </select>
                <button type="submit" class="btn btn-block btn-primary">导入</button>
            </form>
        </div>
        <div v-if="activeTab === tabName.specific">
            specific import
        </div>
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
    skills: ['']
})
function submitBatch() {
    // alert(JSON.stringify(formData.value))
    useFetch('/api/card/import', {
        method: 'post',
        body: formData
    })
}
</script>

<!-- <style lang="postcss" scoped>
select[multiple] {
    @apply h-60;
}
</style> -->