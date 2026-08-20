<template>
  <div>
    <section class="relative overflow-hidden bg-[#17223b] text-white">
      <div class="absolute inset-0 opacity-30" aria-hidden="true">
        <div class="absolute -right-24 top-14 size-80 rounded-full bg-indigo-500 blur-3xl" />
        <div class="absolute bottom-0 left-1/3 size-64 rounded-full bg-cyan-400 blur-3xl" />
      </div>
      <div class="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <p class="mb-5 inline-flex rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-sm font-bold text-indigo-200">Сервис без потерянных обращений</p>
          <h1 class="text-4xl font-black leading-tight tracking-tight sm:text-6xl">Поддержка, в которой всё под контролем</h1>
          <p class="mt-6 max-w-xl text-lg leading-8 text-slate-300">WorkFlow объединяет заявки, команду, сроки SLA и историю общения в одном понятном рабочем пространстве.</p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/login" class="button-primary px-6">Открыть WorkFlow <span aria-hidden="true">→</span></NuxtLink>
            <NuxtLink to="/help" class="button-secondary border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">Посмотреть возможности</NuxtLink>
          </div>
        </div>
        <div class="relative mx-auto w-full max-w-xl">
          <div class="rounded-3xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur">
            <div class="rounded-2xl bg-white p-5 text-slate-900">
              <div class="mb-5 flex items-center justify-between"><div><p class="text-xs font-bold uppercase tracking-widest text-slate-400">Сегодня</p><p class="mt-1 text-xl font-black">Пульс поддержки</p></div><span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">SLA 96%</span></div>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="metric in metrics" :key="metric.label" class="rounded-xl bg-slate-50 p-3"><p class="text-2xl font-black">{{ metric.value }}</p><p class="mt-1 text-[11px] text-slate-500">{{ metric.label }}</p></div>
              </div>
              <div class="mt-4 space-y-2">
                <div v-for="item in preview" :key="item.title" class="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><span class="size-2 rounded-full" :class="item.color" /><p class="min-w-0 flex-1 truncate text-sm font-semibold">{{ item.title }}</p><span class="text-xs text-slate-400">{{ item.time }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="grid gap-5 md:grid-cols-3">
        <article v-for="feature in features" :key="feature.title" class="rounded-2xl border border-slate-200 p-6"><span class="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700" aria-hidden="true">{{ feature.icon }}</span><h2 class="mt-5 text-xl font-black">{{ feature.title }}</h2><p class="mt-2 leading-7 text-slate-500">{{ feature.text }}</p></article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'Сервисные заявки под контролем', description: 'WorkFlow — единое пространство для клиентских заявок, SLA и работы сервисной команды.' })
const metrics = [{ value: '24', label: 'в работе' }, { value: '7', label: 'новых' }, { value: '3', label: 'критичных' }]
const preview = [
  { title: 'Ошибка синхронизации с CRM', time: '8 мин', color: 'bg-rose-500' },
  { title: 'Доступ для нового сотрудника', time: '22 мин', color: 'bg-amber-500' },
  { title: 'Настройка шаблона договора', time: '1 ч', color: 'bg-indigo-500' },
]
const features = [
  { icon: '◫', title: 'Единая очередь', text: 'Заявки из всех каналов, приоритеты и ответственные — в одном рабочем списке.' },
  { icon: '◷', title: 'Прозрачный SLA', text: 'Команда видит приближение сроков, а клиенты понимают статус каждого обращения.' },
  { icon: '↗', title: 'Измеримый сервис', text: 'История, нагрузка и аналитика помогают улучшать качество поддержки на данных.' },
]
</script>
