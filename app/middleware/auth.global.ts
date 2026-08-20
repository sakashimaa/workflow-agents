import type { AuthUser } from '#shared/types/domain'

const publicPaths = ['/', '/login', '/register', '/faq', '/help']

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  const isPublic = publicPaths.includes(to.path) || to.path.startsWith('/articles')
  const isAuthPage = to.path === '/login' || to.path === '/register'

  if (isPublic && !isAuthPage && !auth.initialized) return

  if (!auth.initialized) {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    try {
      const user = await $fetch<AuthUser>('/api/auth/me', { headers })
      auth.setUser(user)
    } catch {
      auth.setUser(null)
    }
  }

  if (!isPublic && !auth.user) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  if (isAuthPage && auth.user) return navigateTo('/dashboard')
})
