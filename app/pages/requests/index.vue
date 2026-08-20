<template>
  <div class="page-wrap pb-28 lg:pb-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p class="text-sm font-semibold text-slate-500">Сервисный центр</p><h1 class="mt-1 text-3xl font-black tracking-tight">Заявки</h1></div><button class="button-primary" type="button" @click="modalOpen = true">＋ Новая заявка</button></div>
    <section class="panel mt-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]" aria-label="Фильтры заявок">
      <div><label for="search" class="label">Поиск</label><input id="search" v-model.trim="search" class="field" type="search" placeholder="Номер, тема или клиент"></div>
      <div><label for="status" class="label">Статус</label><select id="status" v-model="status" class="field"><option value="">Все статусы</option><option v-for="(label, value) in statusLabels" :key="value" :value="value">{{ label }}</option></select></div>
      <div><label for="priority" class="label">Приоритет</label><select id="priority" v-model="priority" class="field"><option value="">Все приоритеты</option><option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option></select></div>
      <button type="button" class="button-secondary self-end" :disabled="!search && !status && !priority" @click="resetFilters">Сбросить</button>
    </section>
    <div class="mt-5 flex items-center justify-between"><p class="text-sm text-slate-500"><strong class="text-slate-900">{{ meta.total }}</strong> заявок</p><select v-model="sort" class="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="updated">Сначала обновлённые</option><option value="priority">По приоритету</option></select></div>
    <div class="mt-3">
      <RequestSkeleton v-if="requestStatus === 'pending'" />
      <StatePanel v-else-if="requestError" kind="error" title="Не удалось загрузить заявки" :description="requestError.statusMessage || 'Проверьте соединение и попробуйте ещё раз.'" action="Повторить" @action="refresh" />
      <StatePanel v-else-if="requests.length === 0" kind="empty" title="Заявки не найдены" description="Попробуйте изменить фильтры или создать новую заявку." action="Сбросить фильтры" @action="resetFilters" />
      <div v-else class="space-y-3"><RequestCard v-for="request in requests" :key="request.id" :request="request" /></div>
    </div>
    <nav v-if="meta.pageCount > 1" class="mt-5 flex items-center justify-between" aria-label="Пагинация заявок">
      <button type="button" class="button-secondary" :disabled="page <= 1 || requestStatus === 'pending'" @click="page--">← Назад</button>
      <span class="text-sm font-semibold text-slate-500">Страница {{ page }} из {{ meta.pageCount }}</span>
      <button type="button" class="button-secondary" :disabled="page >= meta.pageCount || requestStatus === 'pending'" @click="page++">Вперёд →</button>
    </nav>
    <AppModal :open="modalOpen" title="Новая заявка" @close="modalOpen = false">
      <form class="space-y-4" @submit.prevent="createRequest">
        <div><label for="request-title" class="label">Тема</label><input id="request-title" v-model.trim="draftTitle" class="field" required maxlength="140" autofocus></div>
        <div><label for="request-description" class="label">Описание</label><textarea id="request-description" v-model.trim="draftDescription" class="field min-h-28 py-3" required minlength="10" /></div>
        <div v-if="canSelectCustomer"><label for="request-customer" class="label">Клиент</label><select id="request-customer" v-model="draftCustomerId" class="field" required><option value="" disabled>Выберите клиента</option><option v-for="customer in customers" :key="customer.id" :value="customer.id">{{ customer.company }} · {{ customer.name }}</option></select></div>
        <div class="grid gap-4 sm:grid-cols-2"><div><label for="request-priority" class="label">Приоритет</label><select id="request-priority" v-model="draftPriority" class="field"><option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option></select></div><div><label for="request-category" class="label">Категория</label><select id="request-category" v-model="draftCategoryId" class="field" required><option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option></select></div></div>
        <p v-if="createError" class="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700" role="alert">{{ createError }}</p>
        <div class="flex justify-end gap-3 pt-2"><button type="button" class="button-secondary" :disabled="isCreating" @click="modalOpen = false">Отмена</button><button type="submit" class="button-primary" :disabled="isCreating">{{ isCreating ? 'Создаём…' : 'Создать' }}</button></div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { priorityLabels, statusLabels } from '#shared/constants/requests'
import { requestPriorities, requestStatuses, type CategorySummary, type CustomerSummary, type PaginationMeta, type RequestPriority, type RequestStatus, type ServiceRequest } from '#shared/types/domain'
import { normalizeRequest, type RequestListApiResponse } from '~/domain/requests/api'

useSeoMeta({ title: 'Заявки' })
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const routeValue = (name: string) => typeof route.query[name] === 'string' ? route.query[name] : ''
const search = ref(routeValue('q'))
const debouncedSearch = useDebouncedValue(search)
const status = ref<RequestStatus | ''>(requestStatuses.includes(routeValue('status') as RequestStatus) ? routeValue('status') as RequestStatus : '')
const priority = ref<RequestPriority | ''>(requestPriorities.includes(routeValue('priority') as RequestPriority) ? routeValue('priority') as RequestPriority : '')
const sort = ref<'updated' | 'priority'>(routeValue('sort') === 'priority' ? 'priority' : 'updated')
const page = ref(Math.max(1, Number.parseInt(routeValue('page')) || 1))
const modalOpen = ref(route.query.create === '1')
const draftTitle = ref('')
const draftDescription = ref('')
const draftPriority = ref<RequestPriority>('normal')
const draftCategoryId = ref('category-settings')
const draftCustomerId = ref('')
const isCreating = ref(false)
const createError = ref('')

const apiQuery = computed(() => ({
  q: debouncedSearch.value || undefined,
  status: status.value || undefined,
  priority: priority.value || undefined,
  sort: sort.value,
  page: page.value,
  pageSize: 6,
  demo: ['delay', 'error', 'rate-limit', 'empty'].includes(routeValue('demo')) ? routeValue('demo') : undefined,
}))

const { data, status: requestStatus, error: requestError, refresh } = await useFetch('/api/requests', {
  query: apiQuery,
  dedupe: 'cancel',
  transform: (response: RequestListApiResponse) => ({ ...response, data: response.data.map(normalizeRequest) }),
})
const { data: categoryData } = await useFetch<CategorySummary[]>('/api/categories')
const categories = computed(() => categoryData.value ?? [])
const canSelectCustomer = computed(() => ['operator', 'admin'].includes(auth.user?.role ?? ''))
const customerData = ref<CustomerSummary[]>([])
if (canSelectCustomer.value) customerData.value = await useRequestFetch()<CustomerSummary[]>('/api/customers')
const customers = computed(() => customerData.value)
if (customers.value[0]) draftCustomerId.value = customers.value[0].id
const requests = computed(() => data.value?.data ?? [])
const meta = computed<PaginationMeta>(() => data.value?.meta ?? { page: page.value, pageSize: 6, total: 0, pageCount: 1 })

watch([debouncedSearch, status, priority, sort], () => { page.value = 1 })
watch(apiQuery, (query) => {
  const cleanQuery = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== '' && value !== 1 && value !== 'updated'))
  void router.replace({ query: cleanQuery })
})

function resetFilters() { search.value = ''; status.value = ''; priority.value = ''; page.value = 1 }
async function createRequest() {
  if (isCreating.value) return
  isCreating.value = true
  createError.value = ''
  try {
    await $fetch<ServiceRequest>('/api/requests', { method: 'POST', body: { title: draftTitle.value, description: draftDescription.value, priority: draftPriority.value, categoryId: draftCategoryId.value, customerId: draftCustomerId.value || undefined } })
    modalOpen.value = false
    draftTitle.value = ''
    draftDescription.value = ''
    draftPriority.value = 'normal'
    await refresh()
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Не удалось создать заявку'
  } finally {
    isCreating.value = false
  }
}
</script>
