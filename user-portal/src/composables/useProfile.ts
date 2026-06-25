import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { updateProfile } from '@/api/user'
import { startBind, unbind as unbindApi } from '@/api/binding'

export function useProfile() {
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    try {
      await authStore.fetchUser()
    } finally {
      loading.value = false
    }
  }

  async function saveUsername(username: string) {
    await updateProfile({ username })
    await authStore.fetchUser()
  }

  async function saveAvatar(dataUrl: string) {
    await updateProfile({ avatar_url: dataUrl })
    await authStore.fetchUser()
  }

  async function removeAvatar() {
    await updateProfile({ avatar_url: null })
    await authStore.fetchUser()
  }

  async function bind(provider: string) {
    const { authorize_url } = await startBind({ provider, redirect_to: window.location.origin + '/profile' })
    window.location.href = authorize_url
  }

  async function unbind(provider: string) {
    await unbindApi(provider)
    await authStore.fetchUser()
  }

  return { user, loading, error, load, saveUsername, saveAvatar, removeAvatar, bind, unbind }
}
