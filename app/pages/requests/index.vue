<template>
  <div class="page-wrap pb-28 lg:pb-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold text-slate-500">Сервисный центр</p><h1 class="mt-1 text-3xl font-black tracking-tight">Заявки</h1></div><button class="button-primary" type="button" @click="modalOpen = true">＋ Новая заявка</button></div>
    <section class="panel mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]" aria-label="Фильтры заявок">
      <div><label for="search" class="label">Поиск</label><input id="search" v-model.trim="search" class="field" type="search" placeholder="Номер, тема или клиент"></div>
      <div><label for="status" class="label">Статус</label><select id="status" v-model="status" class="field"><option value="">Все статусы</option><option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option></select></div>
      <div><label for="priority" class="label">Приоритет</label><select id="priority" v-model="priority" class="field"><option value="">Все приоритеты</option><option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option></select></div>
      <button type="button" class="button-secondary self-end" :disabled="!search && !status && !priority" @click="resetFilters">Сбросить</button>
    </section>
    <div class="mt-5 flex items-center justify-between"><p class="text-sm text-slate-500"><strong class="text-slate-900">{{ filteredRequests.length }}</strong> заявок</p><select v-model="sort" class="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="updated">Сначала обновлённые</option><option value="priority">По приоритету</option></select></div>
    <div class="mt-3">
      <RequestSkeleton v-if="viewState === 'loading'" />
      <StatePanel v-else-if="viewState === 'error'" kind="error" title="Не удалось загрузить заявки" description="Проверьте соединение и попробуйте ещё раз." action="Повторить" @action="retry" />
      <StatePanel v-else-if="filteredRequests.length === 0" kind="empty" title="Заявки не найдены" description="Попробуйте изменить фильтры или создать новую заявку." action="Сбросить фильтры" @action="resetFilters" />
      <div v-else class="space-y-3"><RequestCard v-for="request in filteredRequests" :key="request.id" :request="request" /></div>
    </div>
    <AppModal :open="modalOpen" title="Новая заявка" @close="modalOpen = false">
      <form class="space-y-4" @submit.prevent="createRequest">
        <div><label for="request-title" class="label">Тема</label><input id="request-title" v-model.trim="draftTitle" class="field" required maxlength="140" autofocus></div>
        <div><label for="request-description" class="label">Описание</label><textarea id="request-description" class="field min-h-28 py-3" required /></div>
        <div><label for="request-priority" class="label">Приоритет</label><select id="request-priority" class="field"><option>Обычный</option><option>Высокий</option><option>Критический</option><option>Низкий</option></select></div>
        <div class="flex justify-end gap-3 pt-2"><button type="button" class="button-secondary" @click="modalOpen = false">Отмена</button><button type="submit" class="button-primary">Создать</button></div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { mockRequests, priorityLabels, statusLabels } from '~/data/requests'
import type { RequestPriority, RequestStatus } from '~/types/request'

useSeoMeta({ title: 'Заявки' })
const route = useRoute()
const search = ref('')
const status = ref<RequestStatus | ''>('')
const priority = ref<RequestPriority | ''>('')
const sort = ref<'updated' | 'priority'>('updated')
const modalOpen = ref(route.query.create === '1')
const draftTitle = ref('')
const viewState = ref<'loading' | 'ready' | 'error'>('loading')

onMounted(() => setTimeout(() => { viewState.value = route.query.demo === 'error' ? 'error' : 'ready' }, 450))

const filteredRequests = computed(() => {
  const priorityRank = { critical: 0, high: 1, normal: 2, low: 3 }
  return mockRequests
    .filter(item => !status.value || item.status === status.value)
    .filter(item => !priority.value || item.priority === priority.value)
    .filter(item => !search.value || `${item.id} ${item.title} ${item.customer} ${item.customerCompany}`.toLowerCase().includes(search.value.toLowerCase()))
    .toSorted((a, b) => sort.value === 'priority' ? priorityRank[a.priority] - priorityRank[b.priority] : b.updatedAt.localeCompare(a.updatedAt))
})

function resetFilters() { search.value = ''; status.value = ''; priority.value = '' }
function retry() { viewState.value = 'loading'; setTimeout(() => { viewState.value = 'ready' }, 500) }
function createRequest() { modalOpen.value = false; draftTitle.value = '' }
</script>
