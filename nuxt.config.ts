// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss'
    ],
    runtimeConfig: {
        sqliteFile: 'db/data.db',
        // user1:pass\nuser2:pass
        basicAuth: '',
    }
})
