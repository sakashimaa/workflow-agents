<template>
  <div v-if="requestStatus === 'pending'" class="page-wrap"><RequestSkeleton /></div>
  <div v-else-if="requestError" class="page-wrap">
    <StatePanel kind="error" title="Не удалось загрузить заявку" :description="requestError.statusMessage || 'Попробуйте повторить запрос.'" action="Повторить" @action="refresh" />
  </div>
  <div v-else-if="request" class="page-wrap pb-28 lg:pb-8">
    <NuxtLink to="/requests" class="inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-500 hover:text-indigo-600">← Все заявки</NuxtLink>

    <div class="mt-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-bold text-slate-400">{{ request.id }}</span>
          <AppBadge :tone="request.status">{{ statusLabels[request.status] }}</AppBadge>
          <AppBadge :tone="request.priority">{{ priorityLabels[request.priority] }}</AppBadge>
        </div>
        <h1 class="mt-3 max-w-4xl text-2xl font-black tracking-tight sm:text-3xl">{{ request.title }}</h1>
      </div>
    </div>

    <div v-if="mutationError" class="mt-5 flex items-start justify-between gap-3 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">
      <span>{{ mutationError }}</span><button type="button" class="rounded font-black" aria-label="Скрыть ошибку" @click="mutationError = ''">×</button>
    </div>
    <div v-if="history.lastChange?.requestId === request.id" class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800" role="status">
      <span>{{ history.lastChange.label }}</span><button type="button" class="font-black underline underline-offset-4 disabled:opacity-50" :disabled="mutationPending !== null" @click="undoLastChange">Отменить</button>
    </div>

    <div class="mt-7 grid gap-6 xl:grid-cols-[1fr_320px]">
      <div class="space-y-6">
        <section class="panel p-5 sm:p-6"><h2 class="text-lg font-black">Описание</h2><p class="mt-3 whitespace-pre-line leading-7 text-slate-600">{{ request.description }}</p></section>

        <section class="panel p-5 sm:p-6">
          <div class="flex items-center justify-between"><h2 class="text-lg font-black">Обсуждение</h2><span class="text-xs text-slate-400">{{ comments.length }} комментарий</span></div>
          <div v-if="comments.length" class="mt-5 space-y-5">
            <article v-for="comment in comments" :key="comment.id" class="flex gap-3">
              <div class="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">{{ comment.avatar }}</div>
              <div class="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-slate-50 p-4">
                <div class="flex flex-wrap items-center justify-between gap-2"><p class="text-sm font-bold">{{ comment.author }}</p><time class="text-xs text-slate-400">{{ formatDate(comment.createdAt) }}</time></div>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ comment.body }}</p>
              </div>
            </article>
          </div>
          <p v-else class="mt-5 text-sm text-slate-500">Комментариев пока нет.</p>
          <form class="mt-6" @submit.prevent="addComment">
            <label for="comment" class="label">Новый комментарий</label>
            <textarea id="comment" v-model.trim="commentBody" class="field min-h-24 py-3" placeholder="Опишите результат или задайте вопрос" required />
            <p v-if="commentError" class="mt-2 text-sm font-semibold text-rose-700" role="alert">{{ commentError }}</p>
            <div class="mt-3 flex justify-end"><button class="button-primary" type="submit" :disabled="!commentBody || commentPending">{{ commentPending ? 'Отправляем…' : 'Отправить' }}</button></div>
          </form>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="panel p-5">
          <h2 class="text-sm font-black uppercase tracking-wide text-slate-400">Управление</h2>
          <div class="mt-5 space-y-4">
            <div><label for="request-status" class="label">Следующий статус</label><select id="request-status" class="field" value="" :disabled="mutationPending !== null || availableTransitions.length === 0" @change="onTransitionSelected"><option value="">{{ availableTransitions.length ? 'Выберите переход' : 'Нет доступных переходов' }}</option><option v-for="value in availableTransitions" :key="value" :value="value">{{ statusLabels[value] }}</option></select></div>
            <div v-if="canManage"><label for="request-priority-detail" class="label">Приоритет</label><select id="request-priority-detail" class="field" :value="request.priority" :disabled="mutationPending !== null" @change="onPriorityChange"><option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option></select></div>
            <div v-if="canManage"><label for="request-assignee" class="label">Исполнитель</label><select id="request-assignee" class="field" :value="request.assigneeId ?? ''" :disabled="mutationPending !== null" @change="onAssigneeChange"><option value="">Не назначен</option><option v-for="agent in agents" :key="agent.id" :value="agent.id" :disabled="agent.status === 'inactive'">{{ agent.name }}{{ agent.status === 'inactive' ? ' (неактивен)' : '' }}</option></select></div>
            <p v-if="mutationPending" class="text-xs font-semibold text-indigo-600" role="status">Сохраняем изменение…</p>
          </div>
        </section>

        <section class="panel p-5"><h2 class="text-sm font-black uppercase tracking-wide text-slate-400">Параметры</h2><dl class="mt-5 space-y-4 text-sm"><div v-for="detail in details" :key="detail.label" class="flex justify-between gap-4"><dt class="text-slate-500">{{ detail.label }}</dt><dd class="text-right font-semibold text-slate-900">{{ detail.value }}</dd></div></dl></section>
        <section class="panel p-5"><h2 class="text-lg font-black">История</h2><ol class="mt-5 space-y-0"><li v-for="(event, index) in request.timeline" :key="event.id" class="relative flex gap-3 pb-6 last:pb-0"><span v-if="index < request.timeline.length - 1" class="absolute left-[7px] top-4 h-full w-px bg-slate-200" /><span class="relative mt-1.5 size-3.5 shrink-0 rounded-full border-4 border-indigo-100 bg-indigo-600" /><div><p class="text-sm font-bold">{{ event.title }}</p><p class="mt-1 text-xs text-slate-500">{{ event.detail }}</p><time class="mt-1 block text-xs text-slate-400">{{ formatDate(event.createdAt) }}</time></div></li></ol></section>
      </aside>
    </div>
    <AppModal :open="transitionModalOpen" title="Изменить статус" @close="closeTransitionModal">
      <form class="space-y-4" @submit.prevent="submitTransition">
        <div class="rounded-xl bg-slate-50 p-4 text-sm"><span class="text-slate-500">Переход:</span> <strong>{{ statusLabels[request.status] }} → {{ transitionTarget ? statusLabels[transitionTarget] : '' }}</strong></div>
        <div v-if="transitionTarget === 'resolved'"><label for="transition-resolution" class="label">Результат решения</label><textarea id="transition-resolution" v-model.trim="transitionResolution" class="field min-h-28 py-3" required placeholder="Что сделано и какой результат получен" /></div>
        <div v-else-if="transitionNeedsReason"><label for="transition-reason" class="label">Причина</label><textarea id="transition-reason" v-model.trim="transitionReason" class="field min-h-24 py-3" required placeholder="Укажите причину перехода" /></div>
        <p v-else class="text-sm leading-6 text-slate-500">Подтвердите изменение статуса заявки.</p>
        <div class="flex justify-end gap-3"><button type="button" class="button-secondary" @click="closeTransitionModal">Отмена</button><button type="submit" class="button-primary" :disabled="mutationPending !== null">Подтвердить</button></div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { priorityLabels, statusLabels } from '#shared/constants/requests'
import { getAllowedTransitions } from '#shared/domain/request-transitions'
import type { RequestComment, RequestPriority, RequestStatus, ServiceRequest, UserSummary } from '#shared/types/domain'
import { normalizeRequest, type RequestApiDto } from '~/domain/requests/api'

const route = useRoute()
const history = useRequestHistoryStore()
const auth = useAuthStore()
const { data: rawRequest, status: requestStatus, error: requestError, refresh } = await useFetch<RequestApiDto>(`/api/requests/${route.params.id}`)
if (requestError.value?.statusCode === 404) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
const request = ref<ServiceRequest | null>(rawRequest.value ? normalizeRequest(rawRequest.value) : null)
watch(rawRequest, value => { if (value) request.value = normalizeRequest(value) })
const { data: userData } = await useFetch<UserSummary[]>('/api/users')
const agents = computed(() => userData.value?.filter(user => user.role === 'agent') ?? [])

useSeoMeta({ title: () => request.value?.title ?? 'Заявка' })
const comments = ref<RequestComment[]>(request.value ? [...request.value.comments] : [])
const commentBody = ref('')
const commentPending = ref(false)
const commentError = ref('')
const mutationPending = ref<'priority' | 'status' | 'assignee' | 'undo' | null>(null)
const mutationError = ref('')
const transitionModalOpen = ref(false)
const transitionTarget = ref<RequestStatus | null>(null)
const transitionReason = ref('')
const transitionResolution = ref('')
const mutationDemo = computed(() => ['delay', 'conflict', 'error'].includes(String(route.query.mutationDemo)) ? String(route.query.mutationDemo) : undefined)
const details = computed(() => [
  { label: 'Клиент', value: request.value?.customer ?? '—' },
  { label: 'Компания', value: request.value?.customerCompany ?? '—' },
  { label: 'Категория', value: request.value?.category ?? '—' },
  { label: 'Срок SLA', value: request.value ? formatDate(request.value.slaDueAt) : '—' },
])
const availableTransitions = computed(() => {
  if (!request.value || !auth.user) return []
  return getAllowedTransitions(request.value.status).filter((status) => {
    if (auth.user?.role === 'client') return status === 'closed'
    if (auth.user?.role === 'agent') return !['assigned', 'escalated', 'closed'].includes(status)
    return true
  })
})
const canManage = computed(() => ['operator', 'admin'].includes(auth.user?.role ?? ''))
const transitionNeedsReason = computed(() => transitionTarget.value === 'waiting' || transitionTarget.value === 'escalated' || (transitionTarget.value === 'closed' && ['operator', 'admin'].includes(auth.user?.role ?? '')))

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

async function updateReversibleField(field: 'priority', next: RequestPriority) {
  if (!request.value || mutationPending.value) return
  const previous = request.value[field]
  if (previous === next) return
  const requestId = request.value.id
  mutationPending.value = field
  mutationError.value = ''
  request.value = { ...request.value, [field]: next }
  try {
    const updated = await $fetch<RequestApiDto>(`/api/requests/${requestId}`, { method: 'PATCH', query: { demo: mutationDemo.value }, body: { [field]: next, expectedVersion: request.value.version } })
    request.value = normalizeRequest(updated)
    history.remember({ requestId, field, previous, next, label: `${field === 'priority' ? 'Приоритет' : 'Статус'} изменён. Можно отменить последнее действие.` })
  } catch (error) {
    if (request.value) request.value = { ...request.value, [field]: previous }
    mutationError.value = errorMessage(error, 'Не удалось сохранить изменение. Значение восстановлено.')
  } finally {
    mutationPending.value = null
  }
}

async function onPriorityChange(event: Event) {
  await updateReversibleField('priority', (event.target as HTMLSelectElement).value as RequestPriority)
}

function onTransitionSelected(event: Event) {
  const target = (event.target as HTMLSelectElement).value as RequestStatus
  if (!target) return
  transitionTarget.value = target
  transitionModalOpen.value = true
  ;(event.target as HTMLSelectElement).value = ''
}

function closeTransitionModal() { transitionModalOpen.value = false; transitionTarget.value = null; transitionReason.value = ''; transitionResolution.value = '' }

async function submitTransition() {
  if (!request.value || !transitionTarget.value || mutationPending.value) return
  const previous = request.value
  const target = transitionTarget.value
  mutationPending.value = 'status'
  mutationError.value = ''
  request.value = { ...request.value, status: target }
  try {
    request.value = normalizeRequest(await $fetch<RequestApiDto>(`/api/requests/${previous.id}/transition`, { method: 'POST', body: { to: target, reason: transitionReason.value || undefined, resolution: transitionResolution.value || undefined, expectedVersion: previous.version } }))
    history.remember({ requestId: previous.id, field: 'status', previous: previous.status, next: target, label: 'Статус изменён. Можно отменить последнее действие.' })
    closeTransitionModal()
  } catch (error) {
    request.value = previous
    mutationError.value = errorMessage(error, 'Не удалось изменить статус. Значение восстановлено.')
  } finally { mutationPending.value = null }
}

async function onAssigneeChange(event: Event) {
  if (!request.value || mutationPending.value) return
  const previous = request.value
  const assigneeId = (event.target as HTMLSelectElement).value || null
  const agent = agents.value.find(item => item.id === assigneeId)
  request.value = { ...request.value, assigneeId, assignee: agent?.name ?? null }
  mutationPending.value = 'assignee'
  mutationError.value = ''
  try {
    request.value = normalizeRequest(await $fetch<RequestApiDto>(`/api/requests/${request.value.id}`, { method: 'PATCH', query: { demo: mutationDemo.value }, body: { assigneeId, expectedVersion: previous.version } }))
  } catch (error) {
    request.value = previous
    mutationError.value = errorMessage(error, 'Не удалось назначить исполнителя.')
  } finally {
    mutationPending.value = null
  }
}

async function undoLastChange() {
  const change = history.lastChange
  if (!request.value || !change || change.requestId !== request.value.id || mutationPending.value) return
  mutationPending.value = 'undo'
  mutationError.value = ''
  try {
    request.value = change.field === 'status'
      ? normalizeRequest(await $fetch<RequestApiDto>(`/api/requests/${request.value.id}/undo`, { method: 'POST', body: { expectedVersion: request.value.version } }))
      : normalizeRequest(await $fetch<RequestApiDto>(`/api/requests/${request.value.id}`, { method: 'PATCH', body: { priority: change.previous, expectedVersion: request.value.version } }))
    history.clear()
  } catch (error) {
    mutationError.value = errorMessage(error, 'Не удалось отменить изменение.')
  } finally {
    mutationPending.value = null
  }
}

async function addComment() {
  if (!commentBody.value || !request.value || commentPending.value) return
  commentPending.value = true
  commentError.value = ''
  try {
    const comment = await $fetch<RequestComment>(`/api/requests/${request.value.id}/comments`, { method: 'POST', body: { body: commentBody.value } })
    comments.value.push(comment)
    commentBody.value = ''
  } catch (error) {
    commentError.value = errorMessage(error, 'Не удалось отправить комментарий.')
  } finally {
    commentPending.value = false
  }
}

function errorMessage(error: unknown, fallback: string) {
  return typeof error === 'object' && error && 'data' in error && typeof error.data === 'object' && error.data && 'statusMessage' in error.data
    ? String(error.data.statusMessage)
    : fallback
}
</script>
