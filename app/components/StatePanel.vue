<template>
  <div class="panel flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center" role="status">
    <div class="mb-4 grid size-12 place-items-center rounded-2xl" :class="iconClass" aria-hidden="true">
      <span class="text-xl">{{ icon }}</span>
    </div>
    <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
    <p class="mt-1 max-w-md text-sm leading-6 text-slate-500">{{ description }}</p>
    <button v-if="action" class="button-secondary mt-5" type="button" @click="$emit('action')">{{ action }}</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  kind: 'empty' | 'error'
  title: string
  description: string
  action?: string
}>()

defineEmits<{ action: [] }>()

const icon = computed(() => props.kind === 'error' ? '!' : '⌕')
const iconClass = computed(() => props.kind === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500')
</script>
