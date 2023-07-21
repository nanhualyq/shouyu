<template>
    <div class="toast toast-top">
        <div class="alert" v-for="row in data" :class="[row.type && `alert-${row.type}`]">
            <span>{{ row.content }}</span>
        </div>
        <!-- try fix alert-* not working -->
        <div class="alert hidden alert-info alert-success alert-warning alert-error"></div>
    </div>
</template>

<script setup>
const data = useToast()
</script>