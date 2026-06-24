// 分组 —— 用户可见分组列表与倍率（密钥筛选/创建表单用）
import { apiClient } from './client'
import type { Group, GroupRates } from './types'

export async function listAvailable(): Promise<Group[]> {
  const { data } = await apiClient.get<Group[]>('/groups/available')
  return data
}

export async function getRates(): Promise<GroupRates> {
  const { data } = await apiClient.get<GroupRates>('/groups/rates')
  return data
}
