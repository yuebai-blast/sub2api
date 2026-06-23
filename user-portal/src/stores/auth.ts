import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/api/types'
import { getProfile } from '@/api/user'
import * as authApi from '@/api/auth'
import { TOKEN_KEY } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!localStorage.getItem(TOKEN_KEY))
  const balance = computed(() => user.value?.balance ?? 0)

  /** 拉取用户资料（含余额）。失败时不抛，调用方按 isAuthenticated 兜底 */
  async function fetchUser(): Promise<void> {
    loading.value = true
    try {
      user.value = await getProfile()
    } catch (e) {
      console.warn('加载用户资料失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function login(username: string, password: string): Promise<void> {
    const resp = await authApi.login({ username, password })
    if (resp.user) {
      user.value = resp.user
    } else {
      await fetchUser()
    }
  }

  async function logout(): Promise<void> {
    await authApi.logout()
    user.value = null
  }

  return { user, loading, isAuthenticated, balance, fetchUser, login, logout }
})
