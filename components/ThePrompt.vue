<template>
    <dialog class="modal" :open="options.open">
        <form method="dialog" class="modal-box" @submit.prevent="options.open = false">
            <h3 class="font-bold text-lg">{{ options.tip }}</h3>
            <p class="py-4">
                <input type="text" class="input input-bordered w-full max-w-xs" v-model="options.value" ref="inputRef" />
            </p>
            <div class="modal-action">
                <button type="button" class="btn" @click="options = {}">取消</button>
                <button type="submit" class="btn btn-primary">确认</button>
            </div>
        </form>
    </dialog>
</template>

<script setup>
const options = useState('the-prompt-options', () => ref({
    open: false,
    value: '',
    tip: ''
}))
const inputRef = ref(null)
watch(options, (val, oldVal) => {
    if (val.open) {
        inputRef.value?.focus()
    }
}, { deep: true })
</script>