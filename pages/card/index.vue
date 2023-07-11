<template>
    <form @submit.prevent="" class="flex flex-wrap gap-2 items-center">
        <select class="select select-bordered select-primary" v-model="formData.book_id">
            <option value="">全部材料</option>
            <option v-for="book in books" :value="book.id">{{ book.name }}</option>
        </select>
        <select class="select select-bordered select-primary" v-model="formData.skill">
            <option value="">全部技能</option>
            <option v-for="skill in ['read', 'write', 'listen', 'speak']" :value="skill">{{ skillCn[skill] }}</option>
        </select>
        <label>
            text_foreign
            <input class="input input-bordered input-primary" type="text" v-model.lazy="formData.text_foreign">
        </label>
        <label>
            text_local
            <input class="input input-bordered input-primary" type="text" v-model.lazy="formData.text_local">
        </label>
        <label>
            due_time
            <input class="input input-bordered input-primary" type="text" v-model.lazy="formData.due_time">
        </label>
        <label>
            update_time
            <input class="input input-bordered input-primary" type="text" v-model.lazy="formData.update_time">
        </label>
        <button type="button" class="btn btn-error" @click="batchDelete">删除全部</button>
        <p>总数： {{ data.total }}</p>
    </form>
    <TheLoading class="full" v-if="pending" />
    <div v-else-if="data?.total > 0" class="overflow-x-auto">
        <table class="table">
            <thead>
                <tr>
                    <th></th>
                    <th>Skill</th>
                    <th>due_time</th>
                    <th>text_foreign</th>
                    <th>text_local</th>
                    <th>update_time</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="card in data.data">
                    <td>{{ card.id }}</td>
                    <td>{{ card.skill }}</td>
                    <td>{{ card.due_time }}</td>
                    <td>{{ card.text_foreign }}</td>
                    <td>{{ card.text_local }}</td>
                    <td>{{ card.update_time }}</td>
                    <td>
                        <button class="btn btn-info btn-xs" @click="reviewRow(card.id)">预览</button>
                        <button class="btn btn-error btn-xs" @click="deleteRow(card.id)">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="join grid grid-cols-3 items-center">
            <button class="join-item btn btn-outline" :disabled="page === 1" @click="page--">上一页</button>
            <p class="text-center">{{ page }} / {{ maxPage }}</p>
            <button class="join-item btn btn-outline" :disabled="page === maxPage" @click="page++">下一页</button>
        </div>
    </div>

    <dialog id="preview_dialog" class="modal" @close="onPreviewClose">
        <form method="dialog" class="modal-box">
            <TheCard :query="cardQuery" is-preview v-if="cardQuery['card.id']" />
        </form>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
const skillCn = useSkillCn()
const page = ref(1)
const maxPage = computed(() => Math.ceil((data?.value?.total || 0) / formData?.value?.limit))
const formData = ref({
    limit: 20,
    book_id: '',
    skill: '',
    text_foreign: '',
    text_local: '',
    due_time: '',
    update_time: '',
    offset: computed(() => (page.value - 1) * formData?.value?.limit)
})
const { data, pending, refresh } = await useFetch('/api/card', {
    query: formData.value
})
const { data: books } = await useFetch('/api/book')
async function batchDelete() {
    if (!confirm(`共${data?.value?.total}个，确认删除？`)) {
        return
    }
    const { error } = await useFetch('/api/card', {
        method: 'delete'
    })
    if (error.value) {
        useErrorDialog(error)
    } else {
        refresh()
    }
}
async function deleteRow(id) {
    if (!confirm(`确认删除？`)) {
        return
    }
    const { error } = await useFetch('/api/card/' + id, {
        method: 'delete'
    })
    if (error.value) {
        useErrorDialog(error)
    } else {
        refresh()
    }
}
const cardQuery = ref({})
function reviewRow(id) {
    cardQuery.value = {
        'card.id': id
    }
    document.getElementById('preview_dialog')?.showModal()
}
function onPreviewClose() {
    cardQuery.value = {}
}
</script>