<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import { verifyOrder } from '@/api/payment'
import type { CreateOrderResult } from '@/api/types'

const props = defineProps<{
  open: boolean
  order: CreateOrderResult | null
}>()

const emit = defineEmits<{
  close: []
  paid: []
}>()

// 当前订单状态（轮询过程中更新）
const status = ref('')
const verifying = ref(false)
const errMsg = ref('')

// 倒计时（秒）
const countdown = ref(0)
let countdownTimer: number | null = null

// 轮询定时器
let pollTimer: number | null = null

// 生成 QR 码图片 URL（使用 qrserver.com 公共 API 渲染）
const qrImageUrl = computed(() => {
  const qr = props.order?.qr_code ?? ''
  if (!qr) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr)}`
})

// 倒计时格式
const countdownLabel = computed(() => {
  if (countdown.value <= 0) return '已过期'
  const m = Math.floor(countdown.value / 60)
  const s = countdown.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// 状态文案
const statusLabel = computed(() => {
  const s = status.value || props.order?.status || ''
  const map: Record<string, string> = {
    pending: '等待支付',
    paid: '支付成功',
    completed: '支付成功',
    failed: '支付失败',
    cancelled: '已取消'
  }
  return map[s] ?? '等待支付'
})

function stopPoll() {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function stopCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdown() {
  stopCountdown()
  const expiresAt = props.order?.expires_at
  if (!expiresAt) return
  const updateTick = () => {
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    countdown.value = diff
  }
  updateTick()
  countdownTimer = window.setInterval(updateTick, 1000)
}

async function doVerify(outTradeNo: string) {
  try {
    const o = await verifyOrder(outTradeNo)
    status.value = o.status
    if (o.status === 'paid' || o.status === 'completed') {
      stopPoll()
      stopCountdown()
      emit('paid')
    } else if (o.status === 'failed') {
      stopPoll()
      stopCountdown()
    }
  } catch {
    // 轮询失败忽略，下次再试
  }
}

function startPoll(outTradeNo: string) {
  stopPoll()
  // 立即查一次
  doVerify(outTradeNo)
  pollTimer = window.setInterval(() => doVerify(outTradeNo), 2000)
}

async function handleManualVerify() {
  if (!props.order?.out_trade_no) return
  verifying.value = true
  errMsg.value = ''
  try {
    await doVerify(props.order.out_trade_no)
  } catch (e) {
    errMsg.value = (e as { message?: string }).message || '查询失败'
  } finally {
    verifying.value = false
  }
}

watch(
  () => props.open,
  (v) => {
    if (v && props.order) {
      status.value = props.order.status || 'pending'
      errMsg.value = ''

      if (props.order.pay_url) {
        // 跳转支付（Stripe / 支付宝 H5 等）
        window.location.href = props.order.pay_url
        return
      }

      // 扫码支付：启动倒计时 + 轮询
      startCountdown()
      if (props.order.out_trade_no) {
        startPoll(props.order.out_trade_no)
      }
    } else {
      stopPoll()
      stopCountdown()
    }
  }
)

onBeforeUnmount(() => {
  stopPoll()
  stopCountdown()
})
</script>

<template>
  <Modal
    :open="open"
    title="扫码支付"
    @close="emit('close')"
  >
    <div
      v-if="order"
      class="flex flex-col items-center gap-4"
    >
      <!-- 二维码 -->
      <div
        v-if="order.qr_code"
        class="flex flex-col items-center gap-3"
      >
        <img
          :src="qrImageUrl"
          alt="支付二维码"
          class="h-[200px] w-[200px] rounded-xl2 border border-border2 bg-muted"
        >
        <p class="text-sm text-text3">
          请使用微信 / 支付宝扫码支付
        </p>

        <!-- 倒计时 -->
        <div
          class="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs text-subtle"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
            />
            <path d="M12 6v6l4 2" />
          </svg>
          二维码有效期：{{ countdownLabel }}
        </div>
      </div>

      <!-- 无二维码时（等待跳转中） -->
      <div
        v-else
        class="py-4 text-sm text-text3"
      >
        正在跳转至支付页面，请稍候…
      </div>

      <!-- 状态 -->
      <div
        class="w-full rounded-xl2 px-4 py-3 text-center text-sm font-medium"
        :class="{
          'bg-pos/[0.08] text-pos': status === 'paid' || status === 'completed',
          'bg-neg/[0.08] text-neg': status === 'failed',
          'bg-muted text-text3': status === 'pending' || !status
        }"
      >
        {{ statusLabel }}
      </div>

      <!-- 错误提示 -->
      <p
        v-if="errMsg"
        class="text-xs text-neg"
      >
        {{ errMsg }}
      </p>
    </div>

    <template #footer>
      <button
        class="rounded-xl2 border border-border2 px-4 py-2 text-sm font-medium text-text3 hover:border-border hover:text-text"
        @click="emit('close')"
      >
        关闭
      </button>
      <button
        class="rounded-xl2 bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        :disabled="verifying"
        @click="handleManualVerify"
      >
        {{ verifying ? '查询中…' : '我已支付 / 刷新' }}
      </button>
    </template>
  </Modal>
</template>
