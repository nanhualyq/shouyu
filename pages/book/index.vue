<template>
    <TheLoading v-if="pending" />
    <div v-else class="flex gap-2 flex-wrap">
        <button class="btn btn-primary btn-block" @click="currentBook = {}">添加材料</button>
        <div v-for="book in books" class="card w-full sm:w-auto bg-base-100 shadow-xl card-bordered">
            <figure><img :src="book.cover" :alt="book.name" class="max-h-52" /></figure>
            <div class="card-body">
                <h2 class="card-title">{{ book.name }}</h2>
                <!-- <p>{{ book.name }}</p> -->
                <div class="card-actions">
                    <NuxtLink class="btn btn-primary" :to="`/book/${book.id}/to-card`">生成卡片</NuxtLink>
                    <NuxtLink class="btn" :to="`/book/${book.id}/sentence`">管理内容</NuxtLink>
                    <button class="btn" @click="currentBook = { ...book }">编辑</button>
                    <button class="btn btn-error" @click="delBook(book)">删除</button>
                </div>
            </div>
        </div>
    </div>
    <dialog id="book_edit_dialog" class="modal" @close="onPreviewClose">
        <form method="dialog" class="modal-box">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <form v-if="currentBook" @submit.prevent="submitBook">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">名字</span>
                    </label>
                    <input v-model="currentBook.name" type="text" class="input input-bordered" />
                </div>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">封面</span>
                    </label>
                    <input v-model="currentBook.cover" type="text" class="input input-bordered" />
                    <div class="avatar mt-2">
                        <div class="w-24 rounded">
                            <img :src="currentBook.cover" />
                        </div>
                    </div>
                </div>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">技能</span>
                    </label>
                    <div class="flex gap-8 flex-wrap">
                        <label class="label cursor-pointer" v-for="skill in skillsArr">
                            <span class="label-text mr-1">{{ skill }}</span>
                            <input type="checkbox" class="checkbox" :value="skill" v-model="skillsChecked" />
                        </label>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary btn-block mt-4">提交</button>
            </form>
        </form>
    </dialog>
</template>

<script setup>
const { pending, data: books, refresh: refreshBooks } = await useFetch('/api/book')
const currentBook = ref(null)
watch(currentBook, (val) => {
    if (val) {
        document.getElementById('book_edit_dialog')?.showModal()
    }
})
async function submitBook() {
    const body = { ...currentBook.value }
    let url = '/api/book'
    let method = 'post'
    if (body.id) {
        url += '/' + body.id
        method = 'PUT'
    }
    body.skills = skillsChecked.value?.join(',')
    const { error } = await fetchWrapper(
        useFetch(url, {
            method,
            body,
            watch: false
        })
    )
    if (!error.value) {
        document.getElementById('book_edit_dialog')?.close()
        refreshBooks()
    }
}
function onPreviewClose() {
    currentBook.value = null
}
const skillsArr = ['read', 'write', 'listen', 'speak']
const skillsChecked = ref([])
watch(currentBook, (val) => {
    if (val?.skills) {
        skillsChecked.value = val?.skills?.split(',')
    } else {
        skillsChecked.value = []
    }
})
async function delBook(book) {
    if (!confirm('确认删除？')) {
        return
    }
    const { error } = await fetchWrapper(
        useFetch('/api/book/' + book.id, {
            method: 'delete'
        })
    )
    if (!error.value) {
        refreshBooks()
    }
}
</script>