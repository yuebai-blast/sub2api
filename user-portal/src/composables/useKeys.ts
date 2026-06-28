import { ref, reactive } from 'vue'
import i18n from '@/i18n'
import * as keysApi from '@/api/keys'
import * as groupsApi from '@/api/groups'
import type { ApiKey, Group, ApiKeyUsageStat, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/api/types'

export function useKeys() {
  const rows = ref<ApiKey[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const filters = reactive<{ search: string; status: string; group_id: string }>({
    search: '',
    status: '',
    group_id: ''
  })
  const groups = ref<Group[]>([])
  const usage = ref<Record<string, ApiKeyUsageStat>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await keysApi.listKeys(page.value, pageSize.value, {
        search: filters.search || undefined,
        status: filters.status || undefined,
        group_id: filters.group_id || undefined
      })
      rows.value = res.items
      total.value = res.total
      loaded.value = true
      // 批量用量（非关键，失败不阻断）
      try {
        usage.value = await keysApi.getKeysUsage(res.items.map((k) => k.id))
      } catch {
        usage.value = {}
      }
    } catch (e) {
      error.value = (e as { message?: string }).message || i18n.global.t('common.loadFailed')
    } finally {
      loading.value = false
    }
  }

  async function loadGroups() {
    try {
      groups.value = await groupsApi.listAvailable()
    } catch {
      groups.value = []
    }
  }

  function setPage(n: number) {
    page.value = n
    load()
  }

  async function create(p: CreateApiKeyRequest) {
    const k = await keysApi.createKey(p)
    await load()
    return k
  }

  async function update(id: number, patch: UpdateApiKeyRequest) {
    await keysApi.updateKey(id, patch)
    await load()
  }

  async function toggle(id: number, status: 'active' | 'inactive') {
    await keysApi.toggleKeyStatus(id, status)
    await load()
  }

  async function remove(id: number) {
    await keysApi.deleteKey(id)
    await load()
  }

  return {
    rows,
    total,
    page,
    pageSize,
    filters,
    groups,
    usage,
    loading,
    error,
    loaded,
    load,
    loadGroups,
    setPage,
    create,
    update,
    toggle,
    remove
  }
}
