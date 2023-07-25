<template>
    <div class="text-center" v-if="!books?.length">
        没有内容，请先
        <NuxtLink to="/book" class="btn btn-primary">添加材料</NuxtLink>
    </div>
    <div v-else class="flex flex-col gap-2">
        <div class="flex gap-2 flex-col md:flex-row">
            <NuxtLink class="btn btn-primary flex-1" :to="reviewUrl">复习到期卡片</NuxtLink>
            <input v-if="needAhead" v-model="aheadDate" class="input border-gray-500 flex-1"
                placeholder="请输入截止日期如 2023-12-25" />
            <button v-else class="btn" @click="needAhead = true">提前复习</button>
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
                    <p :class="{ 'text-gray-400': book.new_total === 0 }">
                        剩余新卡：{{ book.new_total }}</p>
                    <div class="card-actions justify-end">
                        <NuxtLink v-show="book.new_total" class="btn btn-secondary" :to="`/book/${book.id}/plan`">
                            学习新卡</NuxtLink>
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
const needAhead = ref(false)
const aheadDate = ref('')
const reviewUrl = computed(() => {
    let str = '/card/play?random=1&review=1'
    if (aheadDate.value) {
        str += `&due_date=${aheadDate.value}`
    }
    return str
})
</script>