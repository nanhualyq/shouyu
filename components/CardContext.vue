<template>
    <p v-if="query.position > 0" :class="{ loading: pending }">
        <span v-if="loaded">{{ data?.[field] }}</span>
        <button v-else @click="fetchSentence" class="btn btn-xs btn-outline0">{{ props.label }}</button>
    </p>
</template>

<script setup>
const props = defineProps({
    query: {
        type: Object,
        default() {
            return {}
        }
    },
    label: String,
    field: String
})
let data = ref({})
let pending = ref(false)
let loaded = ref(false)
async function fetchSentence() {
    pending.value = true
    useFetch('/api/sentence', { query: props.query })
        .then(res => {
            data.value = res?.data?.value?.data?.[0]
            loaded.value = true
        })
        .finally(() => pending.value = false)
}
</script>