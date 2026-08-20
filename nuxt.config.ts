export default defineNuxtConfig({
  compatibilityDate: '2026-01-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'WorkFlow',
      titleTemplate: '%s · WorkFlow',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#17223b' },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
})
