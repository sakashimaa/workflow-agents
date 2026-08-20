<template>
  <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold" :class="classes">
    <span class="size-1.5 rounded-full bg-current opacity-70" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import type { RequestPriority, RequestStatus } from '~/types/request'

const props = defineProps<{ tone: RequestStatus | RequestPriority | 'success' | 'neutral' }>()

const classes = computed(() => ({
  new: 'bg-blue-50 text-blue-700',
  assigned: 'bg-violet-50 text-violet-700',
  in_progress: 'bg-amber-50 text-amber-700',
  waiting: 'bg-orange-50 text-orange-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
  escalated: 'bg-rose-50 text-rose-700',
  critical: 'bg-rose-50 text-rose-700',
  high: 'bg-orange-50 text-orange-700',
  normal: 'bg-sky-50 text-sky-700',
  low: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
}[props.tone]))
</script>
