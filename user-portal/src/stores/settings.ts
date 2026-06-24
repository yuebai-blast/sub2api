import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PublicSettings } from '@/api/types'
import { getPublicSettings } from '@/api/settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<PublicSettings | null>(null)
  let inflight: Promise<void> | null = null

  async function ensureLoaded(): Promise<void> {
    if (settings.value) return
    if (!inflight) {
      inflight = getPublicSettings()
        .then((s) => { settings.value = s })
        .catch((e) => { console.warn('加载公开设置失败:', e) })
        .finally(() => { inflight = null })
    }
    return inflight
  }

  return { settings, ensureLoaded }
})
