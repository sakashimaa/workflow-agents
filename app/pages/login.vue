<template>
  <div class="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
    <section class="flex items-center justify-center px-4 py-12 sm:px-8">
      <form class="w-full max-w-md" @submit.prevent="login">
        <p class="text-sm font-bold text-indigo-600">С возвращением</p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-900">Войдите в WorkFlow</h1>
        <p class="mt-2 text-slate-500">Используйте рабочую почту и пароль.</p>
        <div class="mt-8 space-y-5">
          <div><label for="email" class="label">Email</label><input id="email" v-model.trim="email" class="field" type="email" autocomplete="email" required></div>
          <div><div class="flex items-center justify-between"><label for="password" class="label">Пароль</label><a href="#" class="mb-1.5 text-xs font-semibold text-indigo-600">Забыли пароль?</a></div><input id="password" v-model="password" class="field" type="password" autocomplete="current-password" required minlength="8"></div>
          <label class="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" class="size-4 rounded border-slate-300 text-indigo-600">Запомнить меня</label>
          <p v-if="errorMessage" class="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{{ errorMessage }}</p>
          <button type="submit" class="button-primary w-full" :disabled="pending || !hydrated">{{ pending ? 'Входим…' : 'Войти' }}</button>
        </div>
        <div class="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p class="text-xs font-black uppercase tracking-wider text-slate-400">Демо-аккаунты</p><div class="mt-3 grid grid-cols-2 gap-2"><button v-for="account in demoAccounts" :key="account.email" type="button" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold hover:border-indigo-300 hover:text-indigo-700" @click="selectAccount(account.email)">{{ account.label }}</button></div><p class="mt-3 text-xs text-slate-500">Пароль для всех: <code>Demo1234!</code></p></div>
        <p class="mt-7 text-center text-sm text-slate-500">Нет аккаунта? <NuxtLink to="/register" class="font-bold text-indigo-600">Создать</NuxtLink></p>
      </form>
    </section>
    <section class="relative hidden overflow-hidden bg-[#17223b] p-12 text-white lg:flex lg:flex-col lg:justify-end"><div class="absolute -right-20 top-20 size-96 rounded-full bg-indigo-500/40 blur-3xl" /><blockquote class="relative max-w-xl text-3xl font-bold leading-snug">«Сервис становится предсказуемым, когда у каждого обращения есть владелец, срок и прозрачная история»</blockquote><p class="relative mt-5 text-slate-400">Команда WorkFlow</p></section>
  </div>
</template>

<script setup lang="ts">
import type { AuthUser } from '#shared/types/domain'

definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'Вход', description: 'Вход в рабочее пространство WorkFlow.' })
const route = useRoute()
const auth = useAuthStore()
const email = ref('operator@workflow.local')
const password = ref('Demo1234!')
const pending = ref(false)
const hydrated = ref(false)
const errorMessage = ref('')
const demoAccounts = [{ label: 'Client', email: 'client@workflow.local' }, { label: 'Operator', email: 'operator@workflow.local' }, { label: 'Agent', email: 'agent@workflow.local' }, { label: 'Admin', email: 'admin@workflow.local' }]

function selectAccount(value: string) { email.value = value; password.value = 'Demo1234!' }
onMounted(() => { hydrated.value = true })
async function login() {
  if (pending.value) return
  pending.value = true
  errorMessage.value = ''
  try {
    auth.setUser(await $fetch<AuthUser>('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } }))
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/dashboard'
    await navigateTo(redirect)
  } catch (error) {
    errorMessage.value = typeof error === 'object' && error && 'data' in error && typeof error.data === 'object' && error.data && 'statusMessage' in error.data ? String(error.data.statusMessage) : 'Не удалось войти'
  } finally {
    pending.value = false
  }
}
</script>
