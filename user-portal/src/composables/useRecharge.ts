import { ref } from 'vue'
import { getCheckoutInfo, createOrder, verifyOrder } from '@/api/payment'
import { redeem as redeemApi } from '@/api/redeem'
import type { CheckoutInfoResponse, CreateOrderResult, RedeemResult, SubscriptionPlan } from '@/api/types'

const PRESETS = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000]

export function useRecharge() {
  const checkout = ref<CheckoutInfoResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  // 选中的预设金额（null 表示使用自定义）
  const amount = ref<number | null>(100)

  // 选中的支付方式
  const method = ref('')

  async function load() {
    loading.value = true
    error.value = null
    try {
      checkout.value = await getCheckoutInfo()
      const keys = Object.keys(checkout.value.methods)
      if (keys.length && !method.value) {
        method.value = keys[0]
      }
      loaded.value = true
    } catch (e) {
      error.value = (e as { message?: string }).message || '加载失败'
    } finally {
      loading.value = false
    }
  }

  async function submitRecharge(): Promise<CreateOrderResult> {
    return createOrder({
      amount: amount.value!,
      payment_type: method.value,
      order_type: 'balance'
    })
  }

  async function submitSubscription(plan: SubscriptionPlan): Promise<CreateOrderResult> {
    return createOrder({
      amount: plan.price,
      payment_type: method.value,
      order_type: 'subscription',
      plan_id: plan.id
    })
  }

  async function redeem(code: string): Promise<RedeemResult> {
    return redeemApi(code)
  }

  return {
    checkout,
    loading,
    error,
    loaded,
    amount,
    method,
    presets: PRESETS,
    load,
    submitRecharge,
    submitSubscription,
    verifyOrder,
    redeem
  }
}
