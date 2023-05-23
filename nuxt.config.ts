// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@sidebase/nuxt-auth'],
    auth: {
        isEnabled: true,
        // NOT FUCKING WORK
        // globalAppMiddleware: true,
        // globalMiddlewareOptions: {
        //     // Whether to allow access to 404 pages without authentication. Set this to `false` to force users to sign-in before seeing `404` pages. Setting this to false may lead to vue-router problems (as the target page does not exist)        
        //     allow404WithoutAuth: true,
        //     // Whether to automatically set the callback url to the page the user tried to visit when the middleware stopped them. This is useful to disable this when using the credentials provider, as it does not allow a `callbackUrl`. Setting this to a string-value will result in that being used as the callbackUrl path. Note: You also need to set the global `addDefaultCallbackUrl` setting to `false` if you want to fully disable this for the global middleware.        
        //     addDefaultCallbackUrl: true
        // }
    },
    runtimeConfig: {
        sqliteFile: 'db/sqlite/data.db'
    }
})
