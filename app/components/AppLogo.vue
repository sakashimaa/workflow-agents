<template>
  <NuxtLink to="/" class="inline-flex items-center gap-2.5 rounded-lg" aria-label="WorkFlow — на главную">
    <span class="grid size-9 place-items-center rounded-xl bg-indigo-500 text-lg font-black text-white shadow-lg shadow-indigo-950/20">W</span>
    <span class="text-lg font-extrabold tracking-tight" :class="light ? 'text-white' : 'text-slate-900'">WorkFlow</span>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>
