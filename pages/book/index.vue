<template>
    <span v-if="pending" class="loading loading-spinner loading-lg"></span>
    <div v-else class="flex gap-2 flex-wrap">
        <div v-for="book in books" class="card w-40 bg-base-100 shadow-xl card-bordered">
            <figure><img :src="book.cover" :alt="book.name" class="max-h-52" /></figure>
            <div class="card-body">
                <h2 class="card-title">{{ book.name }}</h2>
                <!-- <p>{{ book.name }}</p> -->
                <div class="card-actions">
                    <NuxtLink class="btn btn-primary" :to="`/book/${book.id}/import`">导入</NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { pending, data: books } = await useFetch('/api/book')
</script>