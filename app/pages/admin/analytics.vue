<template>
  <div class="page-wrap pb-28 lg:pb-8"><AdminHeader title="Аналитика" description="Оперативный снимок очереди и соблюдения сроков." />
    <div v-if="analytics" class="mt-6 space-y-6"><section class="grid grid-cols-2 gap-3 xl:grid-cols-5"><article v-for="stat in stats" :key="stat.label" class="panel p-5"><p class="text-3xl font-black" :class="stat.tone">{{ stat.value }}</p><p class="mt-2 text-sm text-slate-500">{{ stat.label }}</p></article></section>
      <div class="grid gap-6 xl:grid-cols-2"><section class="panel p-5"><h2 class="font-black">Статусы</h2><div class="mt-5 space-y-4"><div v-for="status in requestStatuses" :key="status"><div class="mb-1.5 flex justify-between text-sm"><span>{{ statusLabels[status] }}</span><strong>{{ analytics.byStatus[status] }}</strong></div><div class="h-2 rounded-full bg-slate-100"><div class="h-full rounded-full bg-indigo-500" :style="{ width: `${ratio(analytics.byStatus[status], analytics.total)}%` }" /></div></div></div></section>
      <section class="panel p-5"><h2 class="font-black">Нагрузка исполнителей</h2><div class="mt-5 divide-y divide-slate-100"><div v-for="agent in analytics.agentLoad" :key="agent.id" class="flex items-center justify-between py-3"><div><p class="text-sm font-bold">{{ agent.name }}</p><p class="text-xs" :class="agent.status === 'active' ? 'text-emerald-600' : 'text-slate-400'">{{ agent.status === 'active' ? 'Активен' : 'Неактивен' }}</p></div><strong>{{ agent.open }} открытых</strong></div></div></section></div>
    </div><StatePanel v-else kind="error" class="mt-6" title="Аналитика недоступна" description="Не удалось получить данные." action="Повторить" @action="refresh" />
  </div>
</template>
<script setup lang="ts">
import { statusLabels } from '#shared/constants/requests'
import { requestStatuses, type AnalyticsSummary } from '#shared/types/domain'
definePageMeta({ middleware: 'admin' }); useSeoMeta({ title: 'Аналитика' })
const { data: analytics, refresh } = await useFetch<AnalyticsSummary>('/api/admin/analytics')
const stats = computed(() => analytics.value ? [
  { label: 'Всего заявок', value: analytics.value.total, tone: 'text-slate-900' }, { label: 'Открытые', value: analytics.value.open, tone: 'text-indigo-700' }, { label: 'Просрочены', value: analytics.value.overdue, tone: 'text-rose-700' }, { label: 'Закрыто сегодня', value: analytics.value.resolvedToday, tone: 'text-emerald-700' }, { label: 'В пределах SLA', value: `${analytics.value.slaCompliance}%`, tone: 'text-emerald-700' },
] : [])
function ratio(value: number, total: number) { return total ? Math.max(3, Math.round(value / total * 100)) : 0 }
</script>
