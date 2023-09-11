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
        <p>总数： {{ data?.total }}</p>
        <ThePagination @update:modelValue="pageChange" :total="data?.total" :limit="formData.limit" />
    </form>

    <el-table class="mt-4" :data="data.data" :border="true" @sort-change="sortChange"
        :default-sort="{ prop: 'update_time', order: 'descending' }">
        <el-table-column prop="id" label="id" sortable="custom" />
        <el-table-column prop="skill" label="skill" />
        <el-table-column prop="due_time" label="due_time" sortable="custom" />
        <el-table-column prop="text_foreign" label="text_foreign" />
        <el-table-column prop="text_local" label="text_local" />
        <el-table-column prop="update_time" label="update_time" sortable="custom" />
        <el-table-column prop="cloze" label="cloze" />
        <el-table-column fixed="right" label="Operations" width="120">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="reviewRow(scope.row.id)">预览</el-button>
                <el-button link type="danger" size="small" @click="deleteRow(scope.row.id)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>

    <dialog id="preview_dialog" class="modal" @close="onPreviewClose">
        <form method="dialog" class="modal-box" @submit.prevent="">
            <TheCard :query="cardQuery" is-preview v-if="cardQuery['card.id']" />
        </form>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<script setup>
const skillCn = useSkillCn()
const formData = ref({
    book_id: '',
    skill: '',
    text_foreign: '',
    text_local: '',
    due_time: '',
    update_time: '',
    limit: 20,
    offset: 0,
    orderby: 'update_time desc'
})
function pageChange(params) {
    formData.value.limit = params.limit
    formData.value.offset = params.offset
}
const { data, pending, refresh, error } = await useFetch('/api/card', {
    query: formData,
    onResponseError({ request, response, options }) {
        useErrorDialog(response)
    }
})
let loading
watch(pending, val => {
    if (val) {
        loading = ElLoading.service({
            lock: true,
        })
    } else {
        loading && loading.close()
    }
})
const { data: books } = await useFetch('/api/book')
async function batchDelete() {
    if (!confirm(`确认删除全部卡片吗？`)) {
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
function sortChange({ column, prop, order }) {
    console.log(order);
    if (order) {
        formData.value.orderby = `${prop} ${order.replace('ending', '')}`
    } else {
        formData.value.orderby = ''
    }
}
</script>