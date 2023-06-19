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
                            v-model="formData.skill" />
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
                <button type="submit" class="btn btn-primary btn-block" :disabled="!formData.skill[0]">开始学习</button>
            </form>
        </ClientOnly>
    </div>
</template>

<script setup>
const { params: { id } } = useRoute()
const { data: book } = useFetch('/api/book/' + id)
const { data, pending } = useFetch('/api/card/new_stats', {
    query: {
        book_id: book.value?.id
    }
})
const skillCn = {
    read: '阅读',
    write: '写作',
    listen: '听力',
    speak: '口语',
}
const skillOrder = {
    read: 0,
    write: 1,
    listen: 2,
    speak: 3
}
const skillOptions = computed(() => {
    return (data?.value || [])
        ?.filter(({ count }) => count > 0)
        ?.map(({ skill, count }) => ({ label: `${skillCn[skill]} (${count})`, value: skill }))
        ?.sort((a, b) => skillOrder[a.value] - skillOrder[b.value])
})
watch(skillOptions, () => {
    const val = skillOptions?.value?.[0]?.value
    if (val) {
        formData.value.skill[0] = val
    }
})
const formData = ref({
    skill: [],
    random: true
})
function gotoPlay() {
    const {skill, random} = formData.value
    useRouter().push({ path: '/card/play', query: {
        book_id: id,
        random,
        skill: skill.join(',')
    } })
}
</script>