import { apiClient } from './client'
import type {
  UserDashboardStats,
  TrendParams,
  TrendResponse,
  ModelStatsResponse,
  PaginatedResponse,
  UsageLog
} from './types'

/** Dashboard 汇总统计 */
export async function getDashboardStats(): Promise<UserDashboardStats> {
  const { data } = await apiClient.get<UserDashboardStats>('/usage/dashboard/stats')
  return data
}

/** Token 使用趋势 */
export async function getDashboardTrend(params?: TrendParams): Promise<TrendResponse> {
  const { data } = await apiClient.get<TrendResponse>('/usage/dashboard/trend', { params })
  return data
}

/** 模型分布 */
export async function getDashboardModels(params?: {
  start_date?: string
  end_date?: string
}): Promise<ModelStatsResponse> {
  const { data } = await apiClient.get<ModelStatsResponse>('/usage/dashboard/models', { params })
  return data
}

/** 按日期区间查询使用记录（取最近若干条） */
export async function getRecentUsage(
  startDate: string,
  endDate: string,
  pageSize = 5
): Promise<PaginatedResponse<UsageLog>> {
  const { data } = await apiClient.get<PaginatedResponse<UsageLog>>('/usage', {
    params: {
      start_date: startDate,
      end_date: endDate,
      page: 1,
      page_size: pageSize,
      sort_by: 'created_at',
      sort_order: 'desc'
    }
  })
  return data
}
