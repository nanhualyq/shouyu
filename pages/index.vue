<template>
    <p>{{ name }}</p>
</template>

<script setup>
const { data: name } = await useLazyFetch('/api/user')
</script>