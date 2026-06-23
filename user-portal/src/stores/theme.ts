import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'theme'
type Mode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<Mode>(readInitial())

  function readInitial(): Mode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark') return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  }

  function apply(): void {
    document.documentElement.classList.toggle('dark', mode.value === 'dark')
  }

  function setMode(m: Mode): void {
    mode.value = m
    try {
      localStorage.setItem(STORAGE_KEY, m)
    } catch {
      // 忽略持久化失败
    }
    apply()
  }

  function toggle(): void {
    setMode(mode.value === 'dark' ? 'light' : 'dark')
  }

  // 初始化即应用到 <html>
  apply()

  return { mode, setMode, toggle }
})
