<template>
    <hot-table ref="hotRef" v-bind="$attrs" licenseKey="non-commercial-and-evaluation" />
</template>

<script setup>
import { HotTable } from '@handsontable/vue3';
import 'handsontable/dist/handsontable.full.css';
import { registerAllModules } from 'handsontable/registry';
registerAllModules();

const hotRef = ref(null)

// const attrs = useAttrs()

defineOptions({
  inheritAttrs: false
})
defineExpose({
    hotRef
})
</script>