<script setup lang="ts">
import type { UserDashboardStats } from '@/api/types'
import { formatNumber, formatTokens, formatDuration } from '@/utils/format'

defineProps<{ stats: UserDashboardStats }>()
</script>

<template>
  <div class="mb-[22px] grid grid-cols-2 gap-[18px] lg:grid-cols-4">
    <!-- API 密钥 -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        API 密钥
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ stats.total_api_keys ?? 0 }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        {{ stats.active_api_keys ?? 0 }} 个已启用
      </div>
    </div>

    <!-- 今日请求 -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        今日请求
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ formatNumber(stats.today_requests ?? 0) }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        累计 {{ formatNumber(stats.total_requests ?? 0) }}
      </div>
    </div>

    <!-- 今日 Token -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        今日 Token
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ formatTokens(stats.today_tokens ?? 0) }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        入 {{ formatTokens(stats.today_input_tokens ?? 0) }} · 出 {{ formatTokens(stats.today_output_tokens ?? 0) }}
      </div>
    </div>

    <!-- 平均响应 -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        平均响应
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ formatDuration(stats.average_duration_ms ?? 0) }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        RPM {{ formatNumber(stats.rpm ?? 0) }} · TPM {{ formatTokens(stats.tpm ?? 0) }}
      </div>
    </div>
  </div>
</template>
