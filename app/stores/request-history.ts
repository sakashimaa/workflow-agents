import { defineStore } from 'pinia'
import type { RequestPriority, RequestStatus } from '#shared/types/domain'

export interface ReversibleChange {
  requestId: string
  field: 'priority' | 'status'
  previous: RequestPriority | RequestStatus
  next: RequestPriority | RequestStatus
  label: string
}

export const useRequestHistoryStore = defineStore('request-history', () => {
  const lastChange = ref<ReversibleChange | null>(null)

  function remember(change: ReversibleChange) {
    lastChange.value = change
  }

  function clear() {
    lastChange.value = null
  }

  return { lastChange, remember, clear }
})
