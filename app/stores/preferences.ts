import { defineStore } from 'pinia'

export type InterfaceDensity = 'comfortable' | 'compact'

export const usePreferencesStore = defineStore('preferences', () => {
  const density = ref<InterfaceDensity>('comfortable')
  const reduceMotion = ref(false)
  const hydrated = ref(false)

  function hydrate(value: Partial<{ density: InterfaceDensity; reduceMotion: boolean }>) {
    if (value.density === 'compact' || value.density === 'comfortable') density.value = value.density
    if (typeof value.reduceMotion === 'boolean') reduceMotion.value = value.reduceMotion
    hydrated.value = true
  }

  return { density, reduceMotion, hydrated, hydrate }
})
