<template>
  <NuxtLayout name="public">
    <div class="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <span class="text-8xl font-black tracking-tighter text-indigo-100">{{ error?.statusCode ?? 500 }}</span>
      <h1 class="mt-4 text-3xl font-black text-slate-900">{{ error?.statusCode === 404 ? 'Страница не найдена' : 'Что-то пошло не так' }}</h1>
      <p class="mt-3 leading-7 text-slate-500">Проверьте адрес или вернитесь на главную страницу WorkFlow.</p>
      <button type="button" class="button-primary mt-7" @click="handleError">Вернуться на главную</button>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
const handleError = () => clearError({ redirect: '/' })
</script>
