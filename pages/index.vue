<template>
    <div class="text-center" v-if="!books?.length">
        没有内容，请先
        <NuxtLink to="/book" class="btn btn-primary">添加材料</NuxtLink>
    </div>
    <div v-else class="flex flex-col gap-2">
        <NuxtLink class="btn btn-primary" to="/card/play?random=1&review=1">复习到期卡片</NuxtLink>

        <div class="overflow-x-auto" v-if="stats?.length">
            <table class="table table-xs border-collapse border">
                <thead>
                    <tr>
                        <th v-for="row in stats" :class="{'text-primary': row === today}">{{ row.date }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th v-for="row in stats" :class="{'text-primary': row === today}">{{ row.count }}</th>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card card-side bg-base-100 shadow-xl" v-for="book in books">
            <figure class="w-40"><img :src="book.cover" :alt="book.name" /></figure>
            <div class="card-body">
                <h2 class="card-title">{{ book.name }}</h2>
                <!-- <p>Click the button to watch on Jetflix app.</p> -->
                <div class="card-actions justify-end">
                    <NuxtLink class="btn btn-secondary" :to="`/book/${book.id}/plan`">学习新卡</NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { data: books } = await useFetch('/api/book/home')
const { data: stats } = await useFetch('/api/card/due_stats')
const today = computed(() => stats?.value?.find(o => (new Date()).toISOString().startsWith(o?.date)))
</script>