import { apiClient } from './client'
import type { User } from './types'

/** 用户资料（含余额 balance） */
export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/user/profile')
  return data
}
