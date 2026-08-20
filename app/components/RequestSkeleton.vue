<template>
  <div class="space-y-3" role="status" aria-label="Загрузка заявок">
    <div v-for="item in 5" :key="item" class="panel animate-pulse p-5">
      <div class="flex items-start gap-4">
        <div class="h-10 w-10 rounded-xl bg-slate-200" />
        <div class="min-w-0 flex-1 space-y-3">
          <div class="h-4 w-2/3 rounded bg-slate-200" />
          <div class="h-3 w-1/3 rounded bg-slate-100" />
        </div>
        <div class="h-6 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
    <span class="sr-only">Заявки загружаются</span>
  </div>
</template>
