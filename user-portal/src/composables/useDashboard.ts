import { ref } from 'vue'
import {
  getDashboardStats,
  getDashboardTrend,
  getDashboardModels,
  getRecentUsage
} from '@/api/usage'
import type {
  UserDashboardStats,
  TrendDataPoint,
  ModelStat,
  UsageLog
} from '@/api/types'
import { toLocalDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'

/** Dashboard 数据加载与状态管理 */
export function useDashboard() {
  const authStore = useAuthStore()

  const stats = ref<UserDashboardStats | null>(null)
  const trend = ref<TrendDataPoint[]>([])
  const models = ref<ModelStat[]>([])
  const recent = ref<UsageLog[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  // 默认近 7 天
  const endDate = ref(toLocalDate(new Date()))
  const startDate = ref(toLocalDate(new Date(Date.now() - 6 * 86_400_000)))

  async function loadAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const [s, t, m] = await Promise.all([
        authStore.fetchUser().then(() => getDashboardStats()),
        getDashboardTrend({
          start_date: startDate.value,
          end_date: endDate.value,
          granularity: 'day'
        }),
        getDashboardModels({ start_date: startDate.value, end_date: endDate.value })
      ])
      stats.value = s
      trend.value = t.trend || []
      models.value = m.models || []
      // 最近使用记录单独加载，失败不影响主体
      try {
        const r = await getRecentUsage(startDate.value, endDate.value, 5)
        recent.value = r.data || []
      } catch {
        recent.value = []
      }
    } catch (e) {
      const err = e as { message?: string }
      error.value = err.message || '加载失败，请稍后重试'
      console.error('加载 Dashboard 失败:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    trend,
    models,
    recent,
    loading,
    error,
    startDate,
    endDate,
    loadAll
  }
}
