// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss'
    ],
    app: {
        head: {
            title: `授渔`
        }
    },
    runtimeConfig: {
        sqliteFile: 'db/data.db',
        // user1:pass\nuser2:pass
        basicAuth: '',
    }
})
