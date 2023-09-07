<template>
    <div class="drawer h-screen">
        <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col h-full">
            <!-- Navbar -->
            <div class="w-full navbar bg-base-300">
                <div class="flex-none lg:hidden">
                    <label for="my-drawer-3" class="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            class="inline-block w-6 h-6 stroke-current">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </label>
                </div>
                <div class="flex-1 px-2 mx-2">授渔</div>
                <div class="flex-none hidden lg:block">
                    <ul class="menu menu-horizontal">
                        <!-- Navbar menu content here -->
                        <NavbarMenu />
                    </ul>
                </div>
            </div>
            <!-- Page content here -->
            <div class="flex-1" :class="{ 'p-3': shouldPadding }">
                <slot />
            </div>
        </div>
        <div class="drawer-side">
            <label for="my-drawer-3" class="drawer-overlay"></label>
            <ul class="menu p-4 w-80 h-full bg-base-100 text-base-content">
                <!-- Sidebar content here -->
                <NavbarMenu />
            </ul>
        </div>
    </div>
</template>
<script setup>
const shouldPadding = computed(() => {
    const { name } = useRoute()
    return !['card-play', 'index'].includes(name)
})
onBeforeUpdate(() => {
    document.getElementById('my-drawer-3').checked = false
})
</script>