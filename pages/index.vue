<template>
    <div class="hero min-h-full" v-if="!books?.length" style="background-image: url(/images/empty-bookcase.jpeg);">
        <div class="hero-overlay bg-opacity-60"></div>
        <div class="hero-content text-center text-neutral-content">
            <div class="max-w-md">
                <h1 class="mb-5 text-5xl font-bold">没有内容</h1>
                <p class="mb-5">
                    第一次使用授渔？请先添加材料。
                    <br>
                    已经添加了材料？别忘了生成卡片
                </p>
                <NuxtLink to="/book" class="btn btn-primary btn-wide">添加材料</NuxtLink>
            </div>
        </div>
    </div>
    <div v-else class="flex flex-col gap-2 p-3">
        <div class="flex gap-2 flex-col md:flex-row">
            <NuxtLink class="btn btn-primary flex-1" :to="reviewUrl">复习到期卡片</NuxtLink>
            <div class="relative">
                <el-date-picker ref="dateRef" v-model="aheadDate" @change="reviewFuture" type="date"
                    value-format="YYYY-MM-DD" size="large" :disabled-date="setDateValia" />
                <button class="btn absolute top-0 left-0 right-0 bottom-0 w-full" @click="openDate">提前复习</button>
            </div>
        </div>

        <div class="overflow-x-auto" v-if="stats?.length">
            <table class="table table-xs border-collapse border">
                <thead>
                    <tr>
                        <th class="border" v-for="row in stats" :class="{ 'text-primary': row === today }">{{
                            formatDate(row.date) }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border" v-for="row in stats" :class="{ 'text-primary': row === today }">{{ row.count }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="flex flex-col md:flex-row gap-4">
            <div class="card card-side bg-base-100 shadow-xl md:w-1/3" v-for="book in books">
                <figure><img :src="book.cover" :alt="book.name" style="max-width: 10rem" /></figure>
                <div class="card-body">
                    <h2 class="card-title">{{ book.name }}</h2>
                    <p class="text-neutral-500 text-xs">复习中：{{ book.old_total }}</p>
                    <div class="card-actions">
                        <NuxtLink v-show="book.new_total" class="btn btn-outline" :to="`/book/${book.id}/plan`">
                            学习新卡({{ book.new_total }})</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { data: books } = await useFetch('/api/book/home')
const { data: stats } = await useFetch('/api/card/due_stats')
const today = computed(() => stats?.value?.find(o => (new Date()).toISOString().startsWith(o?.date)))
function formatDate(str) {
    return str?.replace(/^\d{4}\-/, '')
}
const aheadDate = ref('')
const reviewUrl = computed(() => {
    let str = '/card/play?random=1&review=1'
    if (aheadDate.value) {
        str += `&due_date=${aheadDate.value}`
    }
    return str
})
function reviewFuture() {
    useRouter().push(reviewUrl.value)
}
const dateRef = ref(null)
function openDate() {
    dateRef.value.focus()
}
function setDateValia(date) {
    return date < new Date()
}
</script>