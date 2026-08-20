<template>
  <div class="page-wrap pb-28 lg:pb-8">
    <h1 class="text-3xl font-black">Администрирование</h1><p class="mt-2 text-slate-500">Пользователи, справочники, SLA и показатели сервиса.</p>
    <div class="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink v-for="item in sections" :key="item.to" :to="item.to" class="panel p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"><span class="grid size-11 place-items-center rounded-xl bg-indigo-50 text-xl text-indigo-700">{{ item.icon }}</span><h2 class="mt-5 font-black">{{ item.title }}</h2><p class="mt-2 text-sm leading-6 text-slate-500">{{ item.description }}</p><span class="mt-5 inline-block text-sm font-bold text-indigo-600">Открыть →</span></NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ middleware: 'admin' }); useSeoMeta({ title: 'Администрирование' })
const sections = [
  { to: '/admin/users', icon: '♙', title: 'Пользователи', description: 'Роли, доступ и состояние учётных записей.' },
  { to: '/admin/categories', icon: '▦', title: 'Категории', description: 'Справочник тем сервисных обращений.' },
  { to: '/admin/sla', icon: '◷', title: 'Политики SLA', description: 'Срок первого ответа и решения по приоритетам.' },
  { to: '/admin/analytics', icon: '↗', title: 'Аналитика', description: 'Очередь, просрочки и нагрузка исполнителей.' },
]
</script>
