<template>
    <div class="flex flex-col gap-2">
        <div class="card card-side bg-base-100 shadow-xl" v-for="book in books">
            <figure class="w-40"><img :src="book.cover" :alt="book.name" /></figure>
            <div class="card-body">
                <h2 class="card-title">{{book.name}}</h2>
                <!-- <p>Click the button to watch on Jetflix app.</p> -->
                <div class="card-actions justify-end">
                    <NuxtLink class="btn btn-primary" :to="`/book/${book.id}/plan`">学习新卡</NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { data: books } = await useFetch('/api/book/home')
</script>