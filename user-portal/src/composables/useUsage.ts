import { ref, reactive } from 'vue'
import i18n from '@/i18n'
import { queryUsage, getDashboardStats, type UsageQueryParams } from '@/api/usage'
import { listKeys } from '@/api/keys'
import type { UsageLog, UserDashboardStats, ApiKey } from '@/api/types'
import { toLocalDate } from '@/utils/format'

export function useUsage() {
  const rows = ref<UsageLog[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const stats = ref<UserDashboardStats | null>(null)
  const keys = ref<ApiKey[]>([])
  const filters = reactive({
    api_key_id: '' as number | '',
    start_date: toLocalDate(new Date(Date.now() - 6 * 86_400_000)),
    end_date: toLocalDate(new Date()),
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  function params(pageSizeOverride?: number): UsageQueryParams {
    return {
      page: page.value,
      page_size: pageSizeOverride ?? pageSize.value,
      api_key_id: filters.api_key_id === '' ? undefined : Number(filters.api_key_id),
      start_date: filters.start_date,
      end_date: filters.end_date,
      sort_by: 'created_at',
      sort_order: 'desc',
    }
  }

  async function load() {
    loading.value = true
    error.value = null
    try {
      const [res, s] = await Promise.all([queryUsage(params()), getDashboardStats()])
      rows.value = res.items
      total.value = res.total
      stats.value = s
      loaded.value = true
    } catch (e) {
      error.value = (e as { message?: string }).message || i18n.global.t('common.loadFailed')
    } finally {
      loading.value = false
    }
  }

  async function loadKeys() {
    try {
      keys.value = (await listKeys(1, 100)).items
    } catch {
      keys.value = []
    }
  }

  function setPage(n: number) {
    page.value = n
    load()
  }

  async function fetchForExport(): Promise<UsageLog[]> {
    return (await queryUsage(params(1000))).items
  }

  return {
    rows,
    total,
    page,
    pageSize,
    stats,
    keys,
    filters,
    loading,
    error,
    loaded,
    load,
    loadKeys,
    setPage,
    fetchForExport,
  }
}
