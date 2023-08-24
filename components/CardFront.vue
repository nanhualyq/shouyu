<template>
    <div>
        <CardContext class="other-sentence" :key="current?.card?.id"
            :query="{ book_id: book?.id, lesson: current.sentence.lesson, position: current.sentence.position - 1 }"
            label="查看上一句" :field="frontField" />

        <p class="current-sentence">
            <div v-if="isSkill('read', 'listen')">
                <TheMedia ref="mediaRef" :sentence="current?.sentence" />
            </div>
            <span v-if="!isSkill('listen')" class="inline-flex items-center gap-1">
                <el-icon :size="20" color="rgb(75, 107, 251)">
                    <el-icon-Microphone v-if="isSkill('speak')" />
                    <el-icon-Reading v-if="isSkill('read', 'write')" />
                </el-icon>
                {{ current?.sentence?.[frontField] }}
            </span>
        </p>

        <CardContext class="other-sentence" :key="current?.card?.id"
            :query="{ book_id: book?.id, lesson: current.sentence.lesson, position: current.sentence.position + 1 }"
            label="查看下一句" :field="frontField" />
    </div>
</template>

<script setup>
const props = defineProps({
    book: Object,
    current: Object
})
const book = toRef(props, 'book')
const current = toRef(props, 'current')
const frontField = computed(() => isSkill('write') ? 'text_local' : 'text_foreign')
const mediaRef = ref(null)

function isSkill(...skills) {
    return skills.some(val => val?.toLowerCase() === current?.value?.card?.skill)
}

function replay() {
    mediaRef?.value?.replay()
}
defineExpose({
    replay
})
</script>

<style scoped lang="postcss">
.other-sentence {
    @apply opacity-30;
}

.current-sentence {
    @apply my-2 flex flex-col gap-4;
}
</style>