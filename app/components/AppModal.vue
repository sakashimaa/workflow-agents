<template>
  <dialog ref="dialog" class="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/50" @close="$emit('close')">
    <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <h2 class="text-lg font-bold text-slate-900">{{ title }}</h2>
      <button type="button" class="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Закрыть окно" @click="close">×</button>
    </div>
    <div class="p-5"><slot /></div>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()

watch(() => props.open, (open) => {
  if (open && !dialog.value?.open) dialog.value?.showModal()
  if (!open && dialog.value?.open) dialog.value.close()
})

function close() {
  dialog.value?.close()
  emit('close')
}
</script>
