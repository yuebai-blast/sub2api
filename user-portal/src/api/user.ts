import { apiClient } from './client'
import type { User } from './types'

/** 用户资料（含余额 balance） */
export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/user/profile')
  return data
}

/** 更新当前用户资料（用户名 / 头像） */
export async function updateProfile(profile: {
  username?: string
  avatar_url?: string | null
}): Promise<User> {
  const { data } = await apiClient.put<User>('/user', profile)
  return data
}
