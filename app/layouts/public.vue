<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-slate-100 bg-white/90 backdrop-blur">
      <div class="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <AppLogo />
        <nav class="hidden items-center gap-7 text-sm font-semibold text-slate-600 sm:flex" aria-label="Публичная навигация">
          <NuxtLink to="/faq" class="hover:text-indigo-600">FAQ</NuxtLink>
          <NuxtLink to="/help" class="hover:text-indigo-600">Помощь</NuxtLink>
          <NuxtLink to="/articles" class="hover:text-indigo-600">Статьи</NuxtLink>
        </nav>
        <NuxtLink to="/login" class="button-secondary">Войти</NuxtLink>
      </div>
    </header>
    <main><slot /></main>
  </div>
</template>
