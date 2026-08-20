export function useDebouncedValue<T>(source: Ref<T>, delay = 350) {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = value }, delay)
  })

  onScopeDispose(() => clearTimeout(timer))
  return readonly(debounced)
}
