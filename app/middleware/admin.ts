export default defineNuxtRouteMiddleware(() => {
  if (useAuthStore().user?.role !== 'admin') return navigateTo('/dashboard')
})
