// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        sqliteFile: 'db/sqlite/data.db',
        // user1:pass\nuser2:pass
        basicAuth: '',
    }
})
