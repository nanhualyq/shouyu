<template>
    <div class="flex flex-col">
        <div class="text-sm breadcrumbs">
            <ul>
                <li>
                    <NuxtLink to="/">首页</NuxtLink>
                </li>
                <li>{{ book?.name }}</li>
                <li>学习方案</li>
            </ul>
        </div>
        <ClientOnly>
            <span class="loading" v-if="pending"></span>
            <form @submit.prevent="gotoPlay" class="md:w-96 md:m-auto">
                <div class="form-control" v-for="row in skillOptions">
                    <label class="label cursor-pointer">
                        <span class="label-text mr-2">{{ row.label }}</span>
                        <input type="checkbox" checked="checked" class="checkbox checkbox-lg" :value="row.value"
                            v-model="formData.skills" />
                    </label>
                </div>
                <div class="divider"></div>
                <div class="form-control">
                    <label class="label cursor-pointer">
                        <span class="label-text">随机</span>
                        <input type="checkbox" class="toggle toggle-lg" checked v-model="formData.random" />
                    </label>
                </div>
                <div class="divider"></div>
                <button type="submit" class="btn btn-primary btn-block" :disabled="!formData.skills[0]">开始学习</button>
            </form>
        </ClientOnly>
    </div>
</template>

<script setup>
const { params: { id } } = useRoute()
const { data: book } = await useFetch('/api/book/' + id)
const { data, pending } = await useFetch('/api/card/new_stats', {
    query: {
        book_id: book.value?.id
    }
})
const skillCn = useSkillCn()
const skillOrder = {
    read: 0,
    write: 1,
    listen: 2,
    speak: 3
}
const skillOptions = computed(() => {
    return (data.value || [])
        ?.filter(({ count }) => count > 0)
        ?.map(({ skill, count }) => ({ label: `${skillCn[skill]} (${count})`, value: skill }))
        ?.sort((a, b) => skillOrder[a.value] - skillOrder[b.value])
})
const formData = ref({
    skills: [],
    random: true
})
watch(skillOptions, () => {
    const val = skillOptions?.value?.[0]?.value
    if (val) {
        formData.value.skills[0] = val
    }
}, {
    immediate: true
})
function gotoPlay() {
    const { skills, random } = formData.value
    const query = {
        book_id: id,
        skills: skills.join(',')
    }
    if (random) {
        query.random = 1
    }
    useRouter().push({ path: '/card/play', query })
}
</script>