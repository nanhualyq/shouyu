<template>
  <Head>
    <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <Link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <Link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <Link rel="manifest" href="/site.webmanifest" />
    <Link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
    <Meta name="msapplication-TileColor" content="#da532c" />
    <Meta name="theme-color" content="#ffffff" />
  </Head>

  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>

  <TheErrorDialog />
  <TheLoading class="full" v-show="showFullLoading" />
  <ThePrompt />
</template>

<script setup>
const showFullLoading = useState('fullLoading', () => ref(false))
useHead({
  htmlAttrs: {
    'data-theme': "corporate"
  }
})
</script>