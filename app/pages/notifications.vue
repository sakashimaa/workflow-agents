<template>
  <div class="page-wrap pb-28 lg:pb-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 class="text-3xl font-black">Уведомления</h1><p class="mt-2 text-slate-500">Назначения, SLA и изменения заявок.</p></div>
      <button class="button-secondary" type="button" :disabled="marking || unreadCount === 0" @click="markAllRead">{{ marking ? 'Сохраняем…' : `Прочитать все · ${unreadCount}` }}</button>
    </div>
    <StatePanel v-if="error" class="mt-6" kind="error" title="Не удалось загрузить уведомления" description="Повторите запрос." action="Повторить" @action="refresh" />
    <div v-else class="panel mt-6 divide-y divide-slate-100 overflow-hidden">
      <article v-for="item in notifications" :key="item.id" class="flex gap-4 p-5" :class="{ 'bg-indigo-50/50': !item.readAt }">
        <button type="button" class="mt-1 size-3 shrink-0 rounded-full" :class="item.readAt ? 'bg-slate-200' : 'bg-indigo-500'" :aria-label="item.readAt ? 'Уведомление прочитано' : 'Отметить прочитанным'" :disabled="Boolean(item.readAt)" @click="markRead(item)" />
        <div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><h2 class="font-bold">{{ item.title }}</h2><AppBadge v-if="!item.readAt" tone="assigned">Новое</AppBadge></div><p class="mt-1 text-sm text-slate-500">{{ item.body }}</p><time class="mt-2 block text-xs text-slate-400">{{ formatDate(item.createdAt) }}</time></div>
      </article>
      <div v-if="!notifications.length" class="p-10 text-center text-sm text-slate-500">Новых событий пока нет.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationSummary } from '#shared/types/domain'

useSeoMeta({ title: 'Уведомления' })
const { data, error, refresh } = await useFetch<NotificationSummary[]>('/api/notifications')
const marking = ref(false)
const notifications = computed(() => data.value ?? [])
const unreadCount = computed(() => notifications.value.filter(item => !item.readAt).length)
function formatDate(value: string) { return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
async function markRead(item: NotificationSummary) { if (item.readAt) return; await $fetch('/api/notifications/read', { method: 'PATCH', body: { id: item.id } }); item.readAt = new Date().toISOString() }
async function markAllRead() { marking.value = true; try { await $fetch('/api/notifications/read', { method: 'PATCH', body: {} }); const now = new Date().toISOString(); notifications.value.forEach(item => { if (!item.readAt) item.readAt = now }) } finally { marking.value = false } }
</script>
