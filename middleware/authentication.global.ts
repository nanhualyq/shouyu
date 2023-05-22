// file: ~/middleware/authentication.global.ts
export default defineNuxtRouteMiddleware((to) => {
    const { status, signIn } = useAuth()

    // Return immediately if user is already authenticated
    if (status.value === 'authenticated') {
        return
    }

    /**
     * We cannot directly call and/or return `signIn` here as `signIn` uses async composables under the hood, leading to "nuxt instance undefined errors", see https://github.com/nuxt/framework/issues/5740#issuecomment-1229197529
     *
     * So to avoid calling it, we return it immediately.
     */
    return signIn(undefined, { callbackUrl: to.path }) as ReturnType<typeof navigateTo>
})
