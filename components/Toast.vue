<template>
    <div class="toast toast-top">
        <div class="alert" v-for="row in data" :class="[row.type && `alert-${row.type}`]">
            <span>{{row.content}}</span>
        </div>
    </div>
</template>

<script setup>
const data = useToast()
</script>