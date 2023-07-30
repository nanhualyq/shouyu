<template>
    <input :checked="!!formData?.id" type="checkbox" class="modal-toggle" />
    <div class="modal" v-if="formData">
        <div class="modal-box">
            <h3 class="font-bold text-lg">修改内容</h3>
            <form @submit.prevent="handleSave">
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text">text_foreign</span>
                    </label>
                    <input type="text" v-model="formData.text_foreign" class="input input-bordered w-full max-w-xs" />
                </div>
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text">text_local</span>
                    </label>
                    <input type="text" v-model="formData.text_local" class="input input-bordered w-full max-w-xs" />
                </div>
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text">media_url</span>
                    </label>
                    <input type="text" v-model="formData.media_url" class="input input-bordered w-full max-w-xs" />
                </div>
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text">media_start</span>
                    </label>
                    <input type="text" v-model="formData.media_start" class="input input-bordered w-full max-w-xs" />
                </div>
                <div class="form-control w-full max-w-xs">
                    <label class="label">
                        <span class="label-text">media_end</span>
                    </label>
                    <input type="text" v-model="formData.media_end" class="input input-bordered w-full max-w-xs" />
                </div>
                <div class="modal-action">
                    <button type="submit" class="btn btn-primary">更新</button>
                    <button class="btn" @click="emit('close')">取消</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    sentence: {
        type: Object
    }
})
const emit = defineEmits(['close', 'change'])
const formData = ref()
const sentence = toRef(props, 'sentence')
watch(sentence, val => {
    if (!val) {
        formData.value = val
        return
    }
    formData.value = { ...val }
    if (val['id:1']) {
        formData.value.id = val['id:1']
        delete formData.value['id:1']
    }
})
function handleSave() {
    fetchWrapper(
        useFetch('/api/sentence', {
            method: 'PATCH',
            body: formData,
            watch: false
        })
    )
        .then(() => emit('change', formData.value))
}
</script>