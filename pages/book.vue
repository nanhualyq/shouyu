<template>
    <button v-if="pending" class="btn loading"></button>
    <div v-else class="flex gap-2 flex-wrap">
        <div v-for="book in books" class="card w-40 bg-base-100 shadow-xl card-bordered">
            <figure><img :src="book.cover" :alt="book.name" class="max-h-52" /></figure>
            <div class="card-body">
                <h2 class="card-title">{{ book.name }}</h2>
                <!-- <p>If a dog chews shoes whose shoes does he choose?</p> -->
                <div class="card-actions justify-end">
                    <button class="btn btn-primary">Buy Now</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const { pending, data: books } = await useFetch('/api/book')
</script>