// 支付 / 订单 —— 复刻主前端 /payment 契约（结算信息 / 下单 / 我的订单 / 取消）
import { apiClient } from './client'
import type {
  CheckoutInfoResponse,
  CreateOrderRequest,
  CreateOrderResult,
  PaymentOrder,
  PaginatedResponse
} from './types'

/** 结算页所需的聚合信息（支付方式、限额、汇率、最低额等） */
export async function getCheckoutInfo(): Promise<CheckoutInfoResponse> {
  const { data } = await apiClient.get<CheckoutInfoResponse>('/payment/checkout-info')
  return data
}

/** 创建充值订单 */
export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResult> {
  const { data } = await apiClient.post<CreateOrderResult>('/payment/orders', payload)
  return data
}

/** 当前用户的订单列表 */
export async function getMyOrders(params?: {
  page?: number
  page_size?: number
  status?: string
}): Promise<PaginatedResponse<PaymentOrder>> {
  const { data } = await apiClient.get<PaginatedResponse<PaymentOrder>>('/payment/orders/my', {
    params
  })
  return data
}

/** 取消待支付订单 */
export async function cancelOrder(id: number): Promise<void> {
  await apiClient.post(`/payment/orders/${id}/cancel`)
}
