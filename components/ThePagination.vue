<template>
    <select class="select" v-if="pageCount > 1" v-model="currentPage" @change="handleChange">
        <option v-for="page in pageCount" :value="page">第{{ page }}页</option>
    </select>
</template>

<script setup>
const props = defineProps({
    total: {
        type: Number,
        default: 0
    },
    limit: {
        type: Number,
        default: 50
    }
})
const emit = defineEmits(['update:modelValue'])

const currentPage = ref(1)
const pageCount = computed(() => {
    return Math.ceil(props.total / props.limit) || 0
})
function handleChange() {
    const offset = (currentPage.value - 1) * props.limit
    emit('update:modelValue', {
        total: props.total,
        limit: props.limit,
        currentPage,
        offset
    })
}
function reset() {
    currentPage.value = 1
    handleChange()
}
defineExpose({
    reset
})
</script>