<template>
  <div v-if="request" class="page-wrap pb-28 lg:pb-8">
    <NuxtLink to="/requests" class="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-500 hover:text-indigo-600">← Все заявки</NuxtLink>
    <div class="mt-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
      <div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><span class="text-sm font-bold text-slate-400">{{ request.id }}</span><AppBadge :tone="request.status">{{ statusLabels[request.status] }}</AppBadge><AppBadge :tone="request.priority">{{ priorityLabels[request.priority] }}</AppBadge></div><h1 class="mt-3 max-w-4xl text-2xl font-black tracking-tight sm:text-3xl">{{ request.title }}</h1></div>
      <button type="button" class="button-primary shrink-0">Изменить статус</button>
    </div>
    <div class="mt-7 grid gap-6 xl:grid-cols-[1fr_320px]">
      <div class="space-y-6">
        <section class="panel p-5 sm:p-6"><h2 class="text-lg font-black">Описание</h2><p class="mt-3 whitespace-pre-line leading-7 text-slate-600">{{ request.description }}</p></section>
        <section class="panel p-5 sm:p-6"><div class="flex items-center justify-between"><h2 class="text-lg font-black">Обсуждение</h2><span class="text-xs text-slate-400">{{ comments.length }} комментарий</span></div><div v-if="comments.length" class="mt-5 space-y-5"><article v-for="comment in comments" :key="comment.id" class="flex gap-3"><div class="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">{{ comment.avatar }}</div><div class="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-slate-50 p-4"><div class="flex flex-wrap items-center justify-between gap-2"><p class="text-sm font-bold">{{ comment.author }}</p><time class="text-xs text-slate-400">{{ comment.createdAt }}</time></div><p class="mt-2 text-sm leading-6 text-slate-600">{{ comment.body }}</p></div></article></div><p v-else class="mt-5 text-sm text-slate-500">Комментариев пока нет.</p><form class="mt-6" @submit.prevent="addComment"><label for="comment" class="label">Новый комментарий</label><textarea id="comment" v-model.trim="commentBody" class="field min-h-24 py-3" placeholder="Опишите результат или задайте вопрос" required /><div class="mt-3 flex justify-end"><button class="button-primary" type="submit" :disabled="!commentBody">Отправить</button></div></form></section>
      </div>
      <aside class="space-y-6">
        <section class="panel p-5"><h2 class="text-sm font-black uppercase tracking-wide text-slate-400">Параметры</h2><dl class="mt-5 space-y-4 text-sm"><div v-for="detail in details" :key="detail.label" class="flex justify-between gap-4"><dt class="text-slate-500">{{ detail.label }}</dt><dd class="text-right font-semibold text-slate-900">{{ detail.value }}</dd></div></dl></section>
        <section class="panel p-5"><h2 class="text-lg font-black">История</h2><ol class="mt-5 space-y-0"><li v-for="(event, index) in request.timeline" :key="event.id" class="relative flex gap-3 pb-6 last:pb-0"><span v-if="index < request.timeline.length - 1" class="absolute left-[7px] top-4 h-full w-px bg-slate-200" /><span class="relative mt-1.5 size-3.5 shrink-0 rounded-full border-4 border-indigo-100 bg-indigo-600" /><div><p class="text-sm font-bold">{{ event.title }}</p><p class="mt-1 text-xs text-slate-500">{{ event.detail }}</p><time class="mt-1 block text-xs text-slate-400">{{ event.createdAt }}</time></div></li></ol></section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mockRequests, priorityLabels, statusLabels } from '~/data/requests'
import type { RequestComment } from '~/types/request'

const route = useRoute()
const request = mockRequests.find(item => item.id === route.params.id)
if (!request) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
useSeoMeta({ title: request.title })
const comments = ref<RequestComment[]>([...request.comments])
const commentBody = ref('')
const details = computed(() => [
  { label: 'Клиент', value: request.customer }, { label: 'Компания', value: request.customerCompany }, { label: 'Категория', value: request.category }, { label: 'Исполнитель', value: request.assignee ?? 'Не назначен' }, { label: 'Срок SLA', value: request.slaDueAt },
])
function addComment() { if (!commentBody.value) return; comments.value.push({ id: crypto.randomUUID(), author: 'Анна Морозова', avatar: 'АМ', body: commentBody.value, createdAt: 'Только что' }); commentBody.value = '' }
</script>
