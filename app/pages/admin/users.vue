<template>
  <div class="page-wrap pb-28 lg:pb-8"><AdminHeader title="Пользователи" description="Меняйте роли и блокируйте доступ без удаления истории." />
    <div class="panel mt-6 overflow-x-auto"><table class="w-full min-w-[760px] text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="p-4">Пользователь</th><th class="p-4">Роль</th><th class="p-4">Состояние</th><th class="p-4 text-right">Действие</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="user in users" :key="user.id"><td class="p-4"><strong class="block">{{ user.name }}</strong><span class="text-slate-500">{{ user.email }}</span></td><td class="p-4"><select v-model="user.role" class="field"><option v-for="role in userRoles" :key="role" :value="role">{{ roleLabels[role] }}</option></select></td><td class="p-4"><select v-model="user.status" class="field"><option value="active">Активен</option><option value="inactive">Неактивен</option></select></td><td class="p-4 text-right"><button class="button-secondary" type="button" :disabled="pendingId === user.id" @click="save(user)">{{ pendingId === user.id ? 'Сохраняем…' : 'Сохранить' }}</button></td></tr></tbody></table></div>
    <p v-if="message" class="mt-4 text-sm font-semibold" :class="failed ? 'text-rose-700' : 'text-emerald-700'" role="status">{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import { userRoles, type UserSummary } from '#shared/types/domain'
definePageMeta({ middleware: 'admin' }); useSeoMeta({ title: 'Пользователи' })
const roleLabels = { client: 'Клиент', operator: 'Оператор', agent: 'Исполнитель', admin: 'Администратор' }
const { data } = await useFetch<UserSummary[]>('/api/admin/users'); const users = computed(() => data.value ?? []); const pendingId = ref(''); const message = ref(''); const failed = ref(false)
async function save(user: UserSummary) { pendingId.value = user.id; message.value = ''; try { Object.assign(user, await $fetch<UserSummary>(`/api/admin/users/${user.id}`, { method: 'PATCH', body: { role: user.role, status: user.status } })); failed.value = false; message.value = `${user.name}: изменения сохранены.` } catch { failed.value = true; message.value = 'Не удалось сохранить пользователя.' } finally { pendingId.value = '' } }
</script>
