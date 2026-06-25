<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PortalLayout from '@/layouts/PortalLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import AmountPicker from '@/components/recharge/AmountPicker.vue'
import PayMethodPicker from '@/components/recharge/PayMethodPicker.vue'
import OrderSummary from '@/components/recharge/OrderSummary.vue'
import RedeemCard from '@/components/recharge/RedeemCard.vue'
import PaymentResultModal from '@/components/payment/PaymentResultModal.vue'
import { useRecharge } from '@/composables/useRecharge'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { formatBalance } from '@/utils/format'
import { createOrder } from '@/api/payment'
import type { CreateOrderResult } from '@/api/types'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const { checkout, loading, error, loaded, amount, method, presets, load } = useRecharge()

// 分 tab：0 = 充值，1 = 订阅
const activeTab = ref<0 | 1>(0)

// 是否显示订阅 tab
const showSubscription = computed(() => settingsStore.settings?.purchase_subscription_enabled ?? false)

// 下单中
const submitting = ref(false)
const submitError = ref('')

// 支付结果弹窗
const payModalOpen = ref(false)
const currentOrder = ref<CreateOrderResult | null>(null)

// 成功提示
const successNote = ref('')

// 是否可提交（金额有效 + 支付方式已选 + 未在提交中）
const canSubmit = computed(() => {
  if (!checkout.value || submitting.value) return false
  const min = checkout.value.global_min
  const max = checkout.value.global_max
  const a = amount.value
  if (a === null || a < min || (max > 0 && a > max)) return false
  if (!method.value) return false
  return true
})

async function handleSubmit() {
  if (!canSubmit.value || !amount.value || !method.value) return
  submitting.value = true
  submitError.value = ''
  successNote.value = ''
  try {
    const result = await createOrder({
      amount: amount.value,
      payment_type: method.value,
      order_type: 'balance'
    })
    currentOrder.value = result
    payModalOpen.value = true
  } catch (e) {
    submitError.value = (e as { message?: string }).message || '下单失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

function handlePayModalClose() {
  payModalOpen.value = false
}

async function handlePaid() {
  payModalOpen.value = false
  await authStore.fetchUser()
  successNote.value = '充值成功！余额已更新。'
}

function handleRedeemed() {
  authStore.fetchUser()
}

onMounted(async () => {
  await settingsStore.ensureLoaded()
  await load()
})
</script>

<template>
  <PortalLayout>
    <!-- 页头 -->
    <PageHeader
      title="充值 / 订阅"
      subtitle="为账户余额充值，按量计费即充即用。"
    >
      <template #actions>
        <button
          class="rounded-full bg-card px-4 py-2.5 text-[13px] font-medium text-text2 shadow-pill hover:text-text"
          @click="router.push('/orders')"
        >
          我的订单 →
        </button>
      </template>
    </PageHeader>

    <!-- 加载态 -->
    <div
      v-if="loading && !loaded"
      class="flex items-center justify-center py-24"
    >
      <LoadingSpinner :size="32" />
    </div>

    <!-- 错误态 -->
    <div
      v-else-if="error && !loaded"
      class="rounded-xl3 border border-dashed border-border2 bg-card px-7 py-16 text-center"
    >
      <p class="text-sm text-subtle">
        {{ error }}
      </p>
      <button
        class="mt-4 rounded-full border border-text px-5 py-2 text-sm font-semibold text-text"
        @click="load"
      >
        重试
      </button>
    </div>

    <template v-else-if="loaded && checkout">
      <!-- 成功提示 -->
      <div
        v-if="successNote"
        class="mb-4 rounded-xl2 border border-pos/30 bg-pos/[0.07] px-4 py-3 text-sm font-medium text-pos"
      >
        {{ successNote }}
      </div>

      <!-- 分段控制（充值 / 订阅） -->
      <div class="mb-6 inline-flex gap-1 rounded-full bg-track p-1">
        <button
          class="rounded-full px-6 py-2 text-sm font-medium transition-[background,color,box-shadow] duration-150"
          :class="
            activeTab === 0
              ? 'bg-card font-semibold text-text shadow-pill'
              : 'text-text3 hover:text-text2'
          "
          @click="activeTab = 0"
        >
          充值
        </button>
        <button
          v-if="showSubscription"
          class="rounded-full px-6 py-2 text-sm font-medium transition-[background,color,box-shadow] duration-150"
          :class="
            activeTab === 1
              ? 'bg-card font-semibold text-text shadow-pill'
              : 'text-text3 hover:text-text2'
          "
          @click="activeTab = 1"
        >
          订阅
        </button>
      </div>

      <!-- ============ 充值 tab ============ -->
      <div
        v-if="activeTab === 0"
        class="grid grid-cols-[1fr_360px] items-start gap-[22px]"
      >
        <!-- 左列 -->
        <div class="flex flex-col gap-[22px]">
          <AmountPicker
            v-model="amount"
            :presets="presets"
            :multiplier="checkout.balance_recharge_multiplier"
            :min="checkout.global_min"
            :max="checkout.global_max"
          />

          <PayMethodPicker
            v-model="method"
            :methods="checkout.methods"
          />

          <RedeemCard @redeemed="handleRedeemed" />
        </div>

        <!-- 右列（sticky） -->
        <div class="sticky top-[88px] flex flex-col gap-[18px]">
          <!-- 账户卡 -->
          <div class="relative overflow-hidden rounded-[20px] bg-[#1A1A1A] p-[24px_26px] shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
            <!-- 装饰性点阵背景 -->
            <div
              class="pointer-events-none absolute bottom-[-40px] right-[-30px] h-[180px] w-[180px] opacity-55"
              style="background:linear-gradient(150deg,#0E9E72 0%,#14C28A 50%,rgba(20,194,138,0) 92%);-webkit-mask-image:radial-gradient(#000 2px,transparent 2.2px);mask-image:radial-gradient(#000 2px,transparent 2.2px);-webkit-mask-size:15px 15px;mask-size:15px 15px;"
            />
            <div class="relative">
              <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                充值账户
              </div>
              <div class="mb-[18px] text-[15px] font-semibold text-white">
                {{ authStore.user?.id ?? '—' }}
              </div>
              <div class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                当前余额
              </div>
              <div class="font-serif text-[40px] font-medium leading-none text-white">
                ${{ formatBalance(authStore.balance) }}
              </div>
            </div>
          </div>

          <!-- 订单摘要 + 确认支付按钮 -->
          <OrderSummary
            :amount="amount"
            :multiplier="checkout.balance_recharge_multiplier"
            :balance="authStore.balance"
            :fee-rate="checkout.recharge_fee_rate"
          >
            <template #action>
              <!-- 下单错误提示 -->
              <p
                v-if="submitError"
                class="mb-3 text-xs text-neg"
              >
                {{ submitError }}
              </p>

              <button
                class="w-full rounded-xl2 py-[15px] text-[15px] font-semibold text-white transition-[background,box-shadow,opacity] duration-150"
                :class="
                  canSubmit
                    ? 'cursor-pointer bg-accent shadow-[0_4px_14px_rgba(20,194,138,0.32)] hover:bg-accent/90'
                    : 'cursor-not-allowed bg-accent/40'
                "
                :disabled="!canSubmit || submitting"
                @click="handleSubmit"
              >
                {{ submitting ? '下单中…' : canSubmit ? '确认支付' : '请选择金额' }}
              </button>
            </template>
          </OrderSummary>
        </div>
      </div>

      <!-- ============ 订阅 tab（Task 12 占位） ============ -->
      <div
        v-else-if="activeTab === 1"
        class="rounded-xl3 border border-dashed border-border2 bg-card px-7 py-20 text-center"
      >
        <p class="text-sm text-subtle">
          订阅套餐即将上线，敬请期待。
        </p>
      </div>
    </template>

    <!-- 支付结果弹窗 -->
    <PaymentResultModal
      :open="payModalOpen"
      :order="currentOrder"
      @close="handlePayModalClose"
      @paid="handlePaid"
    />
  </PortalLayout>
</template>
