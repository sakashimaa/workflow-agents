<template><div><NuxtLink to="/admin" class="text-sm font-bold text-slate-500 hover:text-indigo-600">← Администрирование</NuxtLink><h1 class="mt-4 text-3xl font-black">{{ title }}</h1><p class="mt-2 text-slate-500">{{ description }}</p></div></template>
<script setup lang="ts">defineProps<{ title: string; description: string }>()</script>
