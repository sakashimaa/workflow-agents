<template>
  <div class="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
    <section class="flex items-center justify-center px-4 py-12 sm:px-8">
      <form class="w-full max-w-md" @submit.prevent="navigateTo('/dashboard')">
        <p class="text-sm font-bold text-indigo-600">С возвращением</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">Войдите в WorkFlow</h1>
        <p class="mt-2 text-slate-500">Используйте рабочую почту и пароль.</p>
        <div class="mt-8 space-y-5">
          <div><label for="email" class="label">Email</label><input id="email" class="field" type="email" autocomplete="email" value="operator@workflow.local" required></div>
          <div><div class="flex items-center justify-between"><label for="password" class="label">Пароль</label><a href="#" class="mb-1.5 text-xs font-semibold text-indigo-600">Забыли пароль?</a></div><input id="password" class="field" type="password" autocomplete="current-password" value="demo1234" required minlength="8"></div>
          <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" class="size-4 rounded border-slate-300 text-indigo-600">Запомнить меня</label>
          <button type="submit" class="button-primary w-full">Войти</button>
        </div>
        <p class="mt-7 text-center text-sm text-slate-500">Нет аккаунта? <NuxtLink to="/register" class="font-bold text-indigo-600">Создать</NuxtLink></p>
      </form>
    </section>
    <section class="relative hidden overflow-hidden bg-[#17223b] p-12 text-white lg:flex lg:flex-col lg:justify-end">
      <div class="absolute -right-20 top-20 size-96 rounded-full bg-indigo-500/40 blur-3xl" />
      <blockquote class="relative max-w-xl text-3xl font-bold leading-snug">«Сервис становится предсказуемым, когда у каждого обращения есть владелец, срок и прозрачная история»</blockquote>
      <p class="relative mt-5 text-slate-400">Команда WorkFlow</p>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'Вход', description: 'Вход в рабочее пространство WorkFlow.' })
</script>
