<script setup lang="ts">
import type { UsageLog } from '@/api/types'
import {
  formatTokens,
  formatCost,
  formatDuration,
  formatDateTime,
  formatReasoningEffort,
} from '@/utils/format'

defineProps<{ rows: UsageLog[] }>()
</script>

<template>
  <div class="overflow-x-auto">
    <div class="min-w-[1180px]">
      <!-- 表头 -->
      <div
        class="grid gap-[14px] border-b border-track px-[26px] py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-faint"
        style="grid-template-columns: 0.7fr 1.3fr 0.8fr 1fr 0.7fr 0.8fr 1fr 0.9fr 0.7fr 0.7fr 1.1fr"
      >
        <div>密钥</div>
        <div>模型</div>
        <div>强度</div>
        <div>端点</div>
        <div>类型</div>
        <div>计费</div>
        <div>Token</div>
        <div>费用</div>
        <div>首 Token</div>
        <div>耗时</div>
        <div>时间 · UA</div>
      </div>

      <!-- 行 -->
      <div
        v-for="row in rows"
        :key="row.id"
        class="grid items-center gap-[14px] border-b border-[#F4F2EB] px-[26px] py-[18px] transition-colors duration-[120ms] hover:bg-hover"
        style="grid-template-columns: 0.7fr 1.3fr 0.8fr 1fr 0.7fr 0.8fr 1fr 0.9fr 0.7fr 0.7fr 1.1fr"
      >
        <!-- 密钥 -->
        <div class="truncate text-[13px] font-semibold text-text">
          {{ row.api_key?.name ?? '—' }}
        </div>

        <!-- 模型 -->
        <div class="truncate text-[13px] font-medium text-text">
          {{ row.model }}
        </div>

        <!-- 强度 -->
        <div>
          <span
            v-if="row.reasoning_effort"
            class="rounded-[6px] bg-[#9B7BE0]/[0.12] px-2.5 py-[3px] text-[11px] font-semibold text-[#9B7BE0]"
          >
            {{ formatReasoningEffort(row.reasoning_effort) }}
          </span>
          <span
            v-else
            class="text-[13px] text-text3"
          >—</span>
        </div>

        <!-- 端点 -->
        <div class="truncate text-[12px] text-text3">
          {{ row.inbound_endpoint ?? '—' }}
        </div>

        <!-- 类型（流式/同步） -->
        <div>
          <span class="rounded-[6px] bg-[#2A6FDB]/[0.10] px-2.5 py-[3px] text-[11px] font-semibold text-[#2A6FDB]">
            {{ row.stream ? '流式' : '同步' }}
          </span>
        </div>

        <!-- 计费 -->
        <div>
          <span class="rounded-[6px] bg-track px-2.5 py-[3px] text-[11px] font-semibold text-text3">
            {{ row.billing_type }}
          </span>
        </div>

        <!-- Token -->
        <div class="text-[12px] leading-[1.6] text-text3">
          <span class="text-[#2A6FDB]">↓ {{ formatTokens(row.input_tokens) }}</span>
          {{ ' ' }}
          <span class="text-pos">↑ {{ formatTokens(row.output_tokens) }}</span>
          <br>
          <span class="text-[#E8A33D]">⊕ {{ formatTokens(row.cache_read_tokens) }}</span>
        </div>

        <!-- 费用 -->
        <div class="num text-[13px] font-semibold text-pos">
          ${{ formatCost(row.actual_cost) }}
        </div>

        <!-- 首 Token -->
        <div class="text-[12px] text-text2">
          {{ row.first_token_ms != null ? formatDuration(row.first_token_ms) : '—' }}
        </div>

        <!-- 耗时 -->
        <div class="text-[12px] text-text2">
          {{ row.duration_ms != null ? formatDuration(row.duration_ms) : '—' }}
        </div>

        <!-- 时间 · UA -->
        <div class="text-[11px] leading-[1.5] text-text3">
          {{ formatDateTime(row.created_at) }}
          <br>
          <span class="text-faint">{{ row.user_agent ?? '' }}</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="rows.length === 0"
        class="px-[26px] py-16 text-center text-sm text-subtle"
      >
        暂无使用记录
      </div>
    </div>
  </div>
</template>
