// 登录方式绑定 —— 发起第三方绑定（拿授权跳转）/ 解绑
import { apiClient } from './client'
import type { BindStartRequest, BindStartResult, User } from './types'

/** 发起绑定：返回授权 URL，前端跳转 */
export async function startBind(req: BindStartRequest): Promise<BindStartResult> {
  const { data } = await apiClient.post<BindStartResult>('/user/auth-identities/bind/start', req)
  return data
}

/** 解绑指定 provider，返回更新后的用户资料 */
export async function unbind(provider: string): Promise<User> {
  const { data } = await apiClient.delete<User>(`/user/account-bindings/${provider}`)
  return data
}
