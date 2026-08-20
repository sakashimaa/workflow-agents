import { readonly, ref } from 'vue'

export function useSingleFlight<T>(task: () => Promise<T>) {
  const pending = ref(false)
  let active: Promise<T> | null = null

  function run(): Promise<T> {
    if (active) return active
    pending.value = true
    active = task().finally(() => {
      active = null
      pending.value = false
    })
    return active
  }

  return { pending: readonly(pending), run }
}
