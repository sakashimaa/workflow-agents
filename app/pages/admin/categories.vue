<template>
  <div class="page-wrap pb-28 lg:pb-8"><AdminHeader title="Категории" description="Неактивные категории остаются в истории, но недоступны для новых заявок." />
    <div class="mt-6 grid gap-4 xl:grid-cols-2"><form v-for="category in categories" :key="category.id" class="panel p-5" @submit.prevent="save(category)"><div class="flex items-start gap-3"><div class="flex-1"><label :for="`name-${category.id}`" class="label">Название</label><input :id="`name-${category.id}`" v-model.trim="category.name" class="field" required minlength="2"></div><label class="mt-8 flex items-center gap-2 text-sm font-semibold"><input v-model="category.isActive" type="checkbox" class="size-4 accent-indigo-600"> Активна</label></div><div class="mt-4"><label :for="`description-${category.id}`" class="label">Описание</label><textarea :id="`description-${category.id}`" v-model.trim="category.description" class="field min-h-20 py-3" required /></div><div class="mt-4 flex items-center justify-between gap-3"><span class="text-xs text-slate-400">{{ category.id }}</span><button class="button-secondary" type="submit" :disabled="pendingId === category.id">{{ pendingId === category.id ? 'Сохраняем…' : 'Сохранить' }}</button></div></form></div>
    <p v-if="message" class="mt-4 text-sm font-semibold" :class="failed ? 'text-rose-700' : 'text-emerald-700'" role="status">{{ message }}</p>
  </div>
</template>
<script setup lang="ts">
import type { CategorySummary } from '#shared/types/domain'
definePageMeta({ middleware: 'admin' }); useSeoMeta({ title: 'Категории' })
const { data } = await useFetch<CategorySummary[]>('/api/admin/categories'); const categories = computed(() => data.value ?? []); const pendingId = ref(''); const message = ref(''); const failed = ref(false)
async function save(category: CategorySummary) { pendingId.value = category.id; message.value = ''; try { Object.assign(category, await $fetch<CategorySummary>(`/api/admin/categories/${category.id}`, { method: 'PATCH', body: { name: category.name, description: category.description, isActive: category.isActive } })); failed.value = false; message.value = `${category.name}: изменения сохранены.` } catch { failed.value = true; message.value = 'Не удалось сохранить категорию.' } finally { pendingId.value = '' } }
</script>
