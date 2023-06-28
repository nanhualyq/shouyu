<template>
    <li>
        <NuxtLink activeClass="active" to="/">首页</NuxtLink>
    </li>
    <li>
        <NuxtLink :class="{ active: isChildren('/card') }" to="/card">卡片</NuxtLink>
    </li>
    <li>
        <NuxtLink :class="{ active: isChildren('/book') }" to="/book">材料</NuxtLink>
    </li>
</template>

<script setup>
const isChildren = (root) => {
    const {path} = useRoute()
    return (new RegExp(`^${root}(\/.*)?`)) .test(path)
}
</script>