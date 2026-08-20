<template>
  <div class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[248px_1fr]" :class="[`density-${preferences.density}`, { 'reduce-motion': preferences.reduceMotion }]">
    <aside class="hidden min-h-screen bg-[#17223b] px-4 py-6 text-white lg:fixed lg:inset-y-0 lg:block lg:w-[248px]">
      <div class="px-2"><AppLogo light /></div>
      <nav class="mt-9 space-y-1" aria-label="Основная навигация">
        <NuxtLink v-for="item in navigation" :key="item.to" :to="item.to" class="nav-link">
          <span aria-hidden="true">{{ item.icon }}</span><span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div class="absolute inset-x-4 bottom-5 rounded-2xl bg-white/10 p-3">
        <div class="flex items-center gap-3">
          <div class="grid size-9 place-items-center rounded-full bg-indigo-400 text-xs font-extrabold">АМ</div>
          <div class="min-w-0"><p class="truncate text-sm font-bold">Анна Морозова</p><p class="text-xs text-slate-400">Оператор</p></div>
        </div>
      </div>
    </aside>

    <div class="min-w-0 lg:col-start-2">
      <header class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div class="lg:hidden"><AppLogo /></div>
        <p class="hidden text-sm font-semibold text-slate-500 lg:block">Центр сервисных обращений</p>
        <div class="flex items-center gap-2">
          <NuxtLink to="/notifications" class="grid size-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Уведомления">◔</NuxtLink>
          <NuxtLink to="/profile" class="grid size-10 place-items-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700" aria-label="Профиль Анны Морозовой">АМ</NuxtLink>
        </div>
      </header>
      <main><slot /></main>
      <nav class="fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur lg:hidden" aria-label="Мобильная навигация">
        <NuxtLink v-for="item in navigation.slice(0, 4)" :key="item.to" :to="item.to" class="mobile-nav-link"><span aria-hidden="true">{{ item.icon }}</span><span>{{ item.short }}</span></NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const navigation = [
  { to: '/dashboard', label: 'Обзор', short: 'Обзор', icon: '⌂' },
  { to: '/requests', label: 'Заявки', short: 'Заявки', icon: '▤' },
  { to: '/tasks', label: 'Мои задачи', short: 'Задачи', icon: '✓' },
  { to: '/customers', label: 'Клиенты', short: 'Клиенты', icon: '◉' },
  { to: '/notifications', label: 'Уведомления', short: 'События', icon: '◔' },
  { to: '/profile', label: 'Профиль', short: 'Профиль', icon: '♙' },
]
const preferences = usePreferencesStore()
</script>

<style scoped>
.nav-link { @apply flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white; }
.nav-link.router-link-active { @apply bg-indigo-500 text-white shadow-lg shadow-indigo-950/20; }
.mobile-nav-link { @apply flex min-w-14 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-semibold text-slate-500; }
.mobile-nav-link.router-link-active { @apply bg-indigo-50 text-indigo-700; }
.density-compact :deep(.panel) { @apply rounded-xl; }
.density-compact :deep(.panel.p-5), .density-compact :deep(.panel.sm\:p-5) { padding: 0.85rem; }
.reduce-motion :deep(*) { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
</style>
