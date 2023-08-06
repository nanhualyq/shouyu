<template>
    <dialog class="modal" :open="options.open">
        <form method="dialog" class="modal-box">
            <h3 class="font-bold text-lg">{{ options.tip }}</h3>
            <p class="py-4">
                <input type="text" class="input input-bordered w-full max-w-xs" v-model="options.value" />
            </p>
            <div class="modal-action">
                <button type="button" class="btn" @click="options = {}">取消</button>
                <button type="button" class="btn btn-primary" @click="options.open = false">确认</button>
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
</script>