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
  /** 并发限制 */
  concurrency?: number
  avatar_url?: string | null
  role?: string
  status?: 'active' | 'disabled'
  created_at?: string
  /** 各登录方式绑定状态 */
  email_bound?: boolean
  linuxdo_bound?: boolean
  dingtalk_bound?: boolean
  oidc_bound?: boolean
  wechat_bound?: boolean
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
  expires_in?: number
  user?: User
}

/** 注册请求（用户名仅前端用于注册后补充资料，后端由邮箱派生） */
export interface RegisterRequest {
  email: string
  password: string
  verify_code?: string
  invitation_code?: string
}

/** 公开站点设置（仅取本前端所需字段） */
export interface PublicSettings {
  registration_enabled: boolean
  email_verify_enabled: boolean
  invitation_code_enabled: boolean
  password_reset_enabled: boolean
  payment_enabled: boolean
  linuxdo_oauth_enabled: boolean
  dingtalk_oauth_enabled?: boolean
  oidc_oauth_enabled: boolean
  oidc_oauth_provider_name: string
  wechat_oauth_enabled: boolean
  site_name: string
}

// ==================== API 密钥 ====================

export interface ApiKeyGroup {
  id: number
  name: string
  platform?: string
  rate_multiplier?: number
}

export interface ApiKey {
  id: number
  user_id: number
  key: string
  name: string
  group_id: number | null
  status: 'active' | 'inactive' | 'quota_exhausted' | 'expired'
  quota: number
  quota_used: number
  last_used_at: string | null
  expires_at: string | null
  created_at: string
  rate_limit_1d: number
  group?: ApiKeyGroup
}

export interface CreateApiKeyRequest {
  name: string
  group_id?: number | null
  expires_in_days?: number
  quota?: number
}

export interface UpdateApiKeyRequest {
  name?: string
  status?: 'active' | 'inactive'
}

/** 单个密钥的批量用量统计 */
export interface ApiKeyUsageStat {
  api_key_id: number
  today_actual_cost: number
  total_actual_cost: number
}

// ==================== 支付 / 订单 ====================

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'RECHARGING'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUND_REQUESTED'
  | 'REFUNDING'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'REFUND_FAILED'

export interface PaymentOrder {
  id: number
  user_id: number
  amount: number
  pay_amount: number
  currency?: string
  fee_rate: number
  payment_type: string
  out_trade_no: string
  status: OrderStatus
  order_type: 'balance' | 'subscription'
  created_at: string
  expires_at: string
  paid_at?: string
  refund_amount: number
}

export interface MethodLimit {
  currency?: string
  single_min: number
  single_max: number
  fee_rate: number
  available: boolean
}

export interface CheckoutInfoResponse {
  methods: Record<string, MethodLimit>
  global_min: number
  global_max: number
  balance_disabled: boolean
  balance_recharge_multiplier: number
  recharge_fee_rate: number
  stripe_publishable_key: string
}

export interface CreateOrderRequest {
  amount: number
  payment_type: string
  order_type: string
  return_url?: string
}

export interface CreateOrderResult {
  order_id: number
  amount: number
  pay_url?: string
  qr_code?: string
  pay_amount: number
  fee_rate: number
  expires_at: string
  out_trade_no?: string
}

// ==================== 兑换码 ====================

export interface RedeemResult {
  message: string
  type: string
  value: number
  new_balance?: number
  new_concurrency?: number
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
  api_key_id: number
  model: string
  platform?: string
  reasoning_effort?: string | null
  inbound_endpoint?: string | null
  input_tokens: number
  output_tokens: number
  cache_creation_tokens: number
  cache_read_tokens: number
  total_tokens: number
  actual_cost: number
  total_cost: number
  billing_type: number
  stream: boolean
  duration_ms: number | null
  first_token_ms: number | null
  user_agent: string | null
  created_at: string
  api_key?: { id: number; name: string; key: string }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
