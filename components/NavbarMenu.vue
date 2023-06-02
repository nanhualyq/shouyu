<template>
    <li>
        <NuxtLink activeClass="active" to="/">首页</NuxtLink>
    </li>
    <li>
        <NuxtLink :class="{ active: isBook }" to="/book">材料</NuxtLink>
    </li>
</template>

<script setup>
const isBook = computed(() => {
    const {path} = useRoute()
    return /^\/book(\/.*)?/.test(path)
})
</script>