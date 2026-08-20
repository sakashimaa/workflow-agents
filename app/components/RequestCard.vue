<template>
  <NuxtLink
    :to="`/requests/${request.id}`"
    class="panel group block p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div class="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600">
        {{ request.id.slice(-2) }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-slate-400">{{ request.id }}</span>
          <AppBadge :tone="request.status">{{ statusLabels[request.status] }}</AppBadge>
          <AppBadge :tone="request.priority">{{ priorityLabels[request.priority] }}</AppBadge>
        </div>
        <h3 class="mt-2 truncate font-bold text-slate-900 group-hover:text-indigo-700">{{ request.title }}</h3>
        <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
          <span>{{ request.customerCompany }}</span>
          <span>{{ request.assignee ?? 'Не назначена' }}</span>
          <span>SLA: {{ request.slaDueAt }}</span>
        </div>
      </div>
      <span class="self-end text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500 sm:self-center" aria-hidden="true">→</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { priorityLabels, statusLabels } from '~/data/requests'
import type { ServiceRequest } from '~/types/request'

defineProps<{ request: ServiceRequest }>()
</script>
