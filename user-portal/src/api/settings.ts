// 公开站点设置（注册/各 OAuth/支付开关等）
import { apiClient } from './client'
import type { PublicSettings } from './types'

export async function getPublicSettings(): Promise<PublicSettings> {
  const { data } = await apiClient.get<PublicSettings>('/settings/public')
  return data
}
