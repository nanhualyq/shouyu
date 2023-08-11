// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/tailwindcss',
        '@element-plus/nuxt'
    ],

    app: {
        head: {
            title: `授渔${process.env.NODE_ENV === 'production' ? '' : ' - ' + process.env.NODE_ENV}`
        }
    },

    runtimeConfig: {
        sqliteFile: 'sqlite/data.db',
        // user1:pass\nuser2:pass
        basicAuth: '',
        mediaPath: 'media'
    },

    devtools: {
        enabled: true
    },

    elementPlus: { /** Options */ }
})
