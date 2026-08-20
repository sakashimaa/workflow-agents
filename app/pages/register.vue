<template>
  <div class="mx-auto max-w-lg px-4 py-16">
    <h1 class="text-3xl font-black">Создать аккаунт</h1><p class="mt-2 text-slate-500">Регистрация представителя компании.</p>
    <form class="panel mt-8 space-y-5 p-6" @submit.prevent="register">
      <div><label class="label" for="reg-name">Имя</label><input id="reg-name" v-model.trim="form.name" class="field" autocomplete="name" required minlength="2"></div>
      <div><label class="label" for="reg-email">Рабочий email</label><input id="reg-email" v-model.trim="form.email" class="field" type="email" autocomplete="email" required></div>
      <div><label class="label" for="company">Компания</label><input id="company" v-model.trim="form.company" class="field" required minlength="2"></div>
      <div><label class="label" for="reg-password">Пароль</label><input id="reg-password" v-model="form.password" class="field" type="password" autocomplete="new-password" minlength="8" required></div>
      <p v-if="errorMessage" class="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{{ errorMessage }}</p>
      <button class="button-primary w-full" :disabled="pending || !hydrated">{{ pending ? 'Создаём аккаунт…' : 'Зарегистрироваться' }}</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { AuthUser } from '#shared/types/domain'
definePageMeta({ layout: 'public' })
useSeoMeta({ title: 'Регистрация' })
const auth = useAuthStore()
const form = reactive({ name: '', email: '', company: '', password: '' })
const pending = ref(false)
const hydrated = ref(false)
const errorMessage = ref('')
onMounted(() => { hydrated.value = true })
async function register() {
  if (pending.value) return
  pending.value = true
  errorMessage.value = ''
  try {
    auth.setUser(await $fetch<AuthUser>('/api/auth/register', { method: 'POST', body: form }))
    await navigateTo('/dashboard')
  } catch (error) {
    errorMessage.value = typeof error === 'object' && error && 'data' in error && typeof error.data === 'object' && error.data && 'statusMessage' in error.data ? String(error.data.statusMessage) : 'Не удалось создать аккаунт'
  } finally { pending.value = false }
}
</script>
