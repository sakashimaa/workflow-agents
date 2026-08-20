<template>
  <div class="page-wrap pb-28 lg:pb-8"><AdminHeader title="Политики SLA" description="Сроки заданы в календарных минутах и применяются при создании заявки." />
    <div class="panel mt-6 overflow-x-auto"><table class="w-full min-w-[760px] text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="p-4">Приоритет</th><th class="p-4">Первый ответ, мин</th><th class="p-4">Решение, мин</th><th class="p-4">Активна</th><th class="p-4 text-right">Действие</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="policy in policies" :key="policy.priority"><td class="p-4"><AppBadge :tone="policy.priority">{{ priorityLabels[policy.priority] }}</AppBadge></td><td class="p-4"><input v-model.number="policy.responseMinutes" type="number" min="1" class="field w-32"></td><td class="p-4"><input v-model.number="policy.resolutionMinutes" type="number" min="1" class="field w-32"></td><td class="p-4"><input v-model="policy.isActive" type="checkbox" class="size-4 accent-indigo-600" :aria-label="`Политика ${priorityLabels[policy.priority]} активна`"></td><td class="p-4 text-right"><button class="button-secondary" type="button" :disabled="pending === policy.priority" @click="save(policy)">{{ pending === policy.priority ? 'Сохраняем…' : 'Сохранить' }}</button></td></tr></tbody></table></div>
    <p v-if="message" class="mt-4 text-sm font-semibold" :class="failed ? 'text-rose-700' : 'text-emerald-700'" role="status">{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { priorityLabels } from '#shared/constants/requests'
import type { SlaPolicy } from '#shared/types/domain'
definePageMeta({ middleware: 'admin' }); useSeoMeta({ title: 'Политики SLA' })
const { data } = await useFetch<SlaPolicy[]>('/api/admin/sla'); const policies = computed(() => data.value ?? []); const pending = ref(''); const message = ref(''); const failed = ref(false)
async function save(policy: SlaPolicy) { pending.value = policy.priority; message.value = ''; try { Object.assign(policy, await $fetch<SlaPolicy>(`/api/admin/sla/${policy.priority}`, { method: 'PUT', body: { responseMinutes: policy.responseMinutes, resolutionMinutes: policy.resolutionMinutes, isActive: policy.isActive } })); failed.value = false; message.value = `SLA «${priorityLabels[policy.priority]}» сохранён.` } catch { failed.value = true; message.value = 'Проверьте сроки: решение должно быть не раньше первого ответа.' } finally { pending.value = '' } }
</script>
