export default defineNuxtConfig({
  compatibilityDate: '2026-01-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/': { prerender: true },
    '/faq': { prerender: true },
    '/help': { swr: 3600 },
    '/articles': { swr: 3600 },
    '/articles/**': { swr: 3600 },
    '/dashboard': { headers: { 'cache-control': 'private, no-store' } },
    '/requests/**': { headers: { 'cache-control': 'private, no-store' } },
  },
  nitro: {
    compressPublicAssets: true,
  },
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
  runtimeConfig: {
    databaseUrl: '',
    sessionSecret: '',
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },
})
