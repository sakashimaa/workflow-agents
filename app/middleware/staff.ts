export default defineNuxtRouteMiddleware(() => {
  const role = useAuthStore().user?.role
  if (!role || !['operator', 'admin'].includes(role)) return navigateTo('/dashboard')
})
