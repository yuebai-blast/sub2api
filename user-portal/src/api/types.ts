// 与后端契约对应的类型定义（仅 Dashboard 里程碑所需）

/** 统一返回体 */
export interface ApiResponse<T> {
  code: number
  message?: string
  data: T
}

/** 调用方收到的标准化错误 */
export interface ApiError {
  status?: number
  code?: number | string
  message: string
}

// ==================== 用户 ====================

export interface User {
  id: number
  username: string
  email: string
  /** 账户余额（USD） */
  balance: number
  avatar?: string
  role?: string
}

// ==================== 鉴权 ====================

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token?: string
  token?: string
  refresh_token?: string
  user?: User
}

// ==================== Dashboard 统计 ====================

export interface PlatformDashboardStats {
  platform: string
  total_requests: number
  total_tokens: number
  total_actual_cost: number
  today_requests: number
  today_tokens: number
  today_actual_cost: number
}

export interface UserDashboardStats {
  total_api_keys: number
  active_api_keys: number
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  total_tokens: number
  total_cost: number
  total_actual_cost: number
  today_requests: number
  today_input_tokens: number
  today_output_tokens: number
  today_tokens: number
  today_cost: number
  today_actual_cost: number
  average_duration_ms: number
  rpm: number
  tpm: number
  by_platform?: PlatformDashboardStats[]
}

export interface TrendParams {
  start_date?: string
  end_date?: string
  granularity?: 'day' | 'hour'
}

export interface TrendDataPoint {
  date: string
  requests: number
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface TrendResponse {
  trend: TrendDataPoint[]
  start_date: string
  end_date: string
  granularity: string
}

export interface ModelStat {
  model: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface ModelStatsResponse {
  models: ModelStat[]
  start_date: string
  end_date: string
}

// ==================== 使用记录 ====================

export interface UsageLog {
  id: number
  model: string
  platform?: string
  total_tokens: number
  actual_cost: number
  created_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
