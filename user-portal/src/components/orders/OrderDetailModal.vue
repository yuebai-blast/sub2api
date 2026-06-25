<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { orderStatusMeta, formatCNY, formatBalance, formatDateMinute } from '@/utils/format'
import type { PaymentOrder } from '@/api/types'

defineProps<{ open: boolean; order: PaymentOrder | null }>()
const emit = defineEmits<{ close: [] }>()

function orderKind(orderType: string): string {
  return orderType === 'balance' ? '账户充值' : '订阅'
}
</script>

<template>
  <Modal
    :open="open"
    title="订单详情"
    @close="emit('close')"
  >
    <template v-if="order">
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-4">
          <span class="text-[13px] text-text3">订单编号</span>
          <span class="break-all text-right text-[13px] font-medium text-text">{{ order.out_trade_no }}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-text3">订单类型</span>
          <span class="text-[13px] font-medium text-text">{{ orderKind(order.order_type) }}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-text3">充值金额</span>
          <span class="font-serif text-[15px] font-semibold text-text">${{ formatBalance(order.amount) }}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-text3">实付金额</span>
          <span class="font-serif text-[15px] font-semibold text-text">¥{{ formatCNY(order.pay_amount) }}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-text3">支付方式</span>
          <span class="text-[13px] font-medium text-text">{{ order.payment_type }}</span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-text3">订单状态</span>
          <StatusBadge v-bind="orderStatusMeta(order.status)" />
        </div>
        <div class="my-2 border-t border-track" />
        <div class="flex items-center justify-between gap-4">
          <span class="text-[13px] text-text3">创建时间</span>
          <span class="text-[13px] text-text">{{ formatDateMinute(order.created_at) }}</span>
        </div>
        <div
          v-if="order.expires_at"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-[13px] text-text3">到期时间</span>
          <span class="text-[13px] text-text">{{ formatDateMinute(order.expires_at) }}</span>
        </div>
        <div
          v-if="order.paid_at"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-[13px] text-text3">支付时间</span>
          <span class="text-[13px] text-text">{{ formatDateMinute(order.paid_at) }}</span>
        </div>
        <div
          v-if="order.refund_amount"
          class="flex items-center justify-between gap-4"
        >
          <span class="text-[13px] text-text3">退款金额</span>
          <span class="text-[13px] font-medium text-neg">¥{{ formatCNY(order.refund_amount) }}</span>
        </div>
        <div
          v-if="order.refund_reason"
          class="flex items-start justify-between gap-4"
        >
          <span class="shrink-0 text-[13px] text-text3">退款原因</span>
          <span class="text-right text-[13px] text-text">{{ order.refund_reason }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <button
        class="rounded-full border border-border px-5 py-2 text-sm font-medium text-text2 transition-colors hover:bg-muted"
        @click="emit('close')"
      >
        关闭
      </button>
    </template>
  </Modal>
</template>
