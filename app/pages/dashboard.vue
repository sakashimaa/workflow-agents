<template>
  <div class="page-wrap pb-28 lg:pb-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p class="text-sm font-semibold text-slate-500">Четверг, 20 августа</p><h1 class="mt-1 text-3xl font-black tracking-tight">Добрый день, Анна</h1></div>
      <NuxtLink to="/requests?create=1" class="button-primary">＋ Новая заявка</NuxtLink>
    </div>
    <section class="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ключевые показатели">
      <article v-for="stat in stats" :key="stat.label" class="panel p-4 sm:p-5"><div class="flex items-center justify-between"><span class="grid size-9 place-items-center rounded-xl" :class="stat.tone">{{ stat.icon }}</span><span class="text-xs font-bold" :class="stat.delta.startsWith('+') ? 'text-emerald-600' : 'text-slate-400'">{{ stat.delta }}</span></div><p class="mt-4 text-3xl font-black">{{ stat.value }}</p><p class="mt-1 text-sm text-slate-500">{{ stat.label }}</p></article>
    </section>
    <div class="mt-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
      <section><div class="mb-3 flex items-center justify-between"><h2 class="text-lg font-black">Требуют внимания</h2><NuxtLink to="/requests" class="text-sm font-bold text-indigo-600">Все заявки →</NuxtLink></div><div class="space-y-3"><RequestCard v-for="request in urgentRequests" :key="request.id" :request="request" /></div></section>
      <section class="panel p-5"><div class="flex items-center justify-between"><h2 class="text-lg font-black">Нагрузка команды</h2><span class="text-xs text-slate-400">сегодня</span></div><div class="mt-6 space-y-5"><div v-for="agent in agents" :key="agent.name"><div class="mb-2 flex items-center justify-between text-sm"><span class="font-semibold">{{ agent.name }}</span><span class="text-slate-500">{{ agent.value }} заявок</span></div><div class="h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-indigo-500" :style="{ width: `${agent.load}%` }" /></div></div></div><div class="mt-7 rounded-xl bg-emerald-50 p-4"><p class="text-sm font-bold text-emerald-800">96% заявок в пределах SLA</p><p class="mt-1 text-xs leading-5 text-emerald-700">На 4% лучше показателя прошлой недели.</p></div></section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mockRequests } from '~/data/requests'
useSeoMeta({ title: 'Обзор' })
const urgentRequests = mockRequests.filter(item => ['critical', 'high'].includes(item.priority)).slice(0, 4)
const stats = [
  { label: 'Открытые заявки', value: '24', delta: '+5', icon: '▤', tone: 'bg-indigo-50 text-indigo-700' },
  { label: 'Критические', value: '3', delta: '+1', icon: '!', tone: 'bg-rose-50 text-rose-700' },
  { label: 'Ожидают клиента', value: '7', delta: '—', icon: '◷', tone: 'bg-amber-50 text-amber-700' },
  { label: 'Закрыто сегодня', value: '18', delta: '+12%', icon: '✓', tone: 'bg-emerald-50 text-emerald-700' },
]
const agents = [{ name: 'Анна Морозова', value: 8, load: 80 }, { name: 'Денис Фролов', value: 6, load: 60 }, { name: 'Сергей Ким', value: 4, load: 40 }]
</script>
