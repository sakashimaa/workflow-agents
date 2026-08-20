export default defineNuxtPlugin(() => {
  const preferences = usePreferencesStore()
  const storageKey = 'workflow:preferences'

  try {
    const stored = localStorage.getItem(storageKey)
    preferences.hydrate(stored ? JSON.parse(stored) : {})
  } catch {
    preferences.hydrate({})
  }

  preferences.$subscribe((_mutation, state) => {
    localStorage.setItem(storageKey, JSON.stringify({ density: state.density, reduceMotion: state.reduceMotion }))
  })
})
