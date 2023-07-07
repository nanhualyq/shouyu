<template>
  <NuxtLayout>
    <NuxtLoadingIndicator /> <!-- here -->
    <NuxtPage />
  </NuxtLayout>
  <TheToast />
  <TheErrorDialog />
  <TheLoading class="full" v-show="showFullLoading" />
</template>

<script setup>
const showFullLoading = useState('fullLoading', () => ref(false))
</script>