import { defineStore } from 'pinia'
import type { AuthUser } from '#shared/types/domain'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)

  function setUser(value: AuthUser | null) {
    user.value = value
    initialized.value = true
  }

  function clear() {
    user.value = null
    initialized.value = true
  }

  return { user, initialized, setUser, clear }
})
