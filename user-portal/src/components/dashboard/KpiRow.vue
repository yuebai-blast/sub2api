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
        {{ $t('dashboard.kpi.apiKeys') }}
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ stats.total_api_keys ?? 0 }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        {{ $t('dashboard.kpi.enabled', { count: stats.active_api_keys ?? 0 }) }}
      </div>
    </div>

    <!-- 今日请求 -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        {{ $t('dashboard.kpi.todayRequests') }}
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ formatNumber(stats.today_requests ?? 0) }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        {{ $t('dashboard.kpi.totalRequests', { value: formatNumber(stats.total_requests ?? 0) }) }}
      </div>
    </div>

    <!-- 今日 Token -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        {{ $t('dashboard.kpi.todayTokens') }}
      </div>
      <div class="num text-[34px] font-medium leading-none text-text">
        {{ formatTokens(stats.today_tokens ?? 0) }}
      </div>
      <div class="mt-2.5 text-xs text-subtle">
        {{ $t('dashboard.kpi.inOut', { input: formatTokens(stats.today_input_tokens ?? 0), output: formatTokens(stats.today_output_tokens ?? 0) }) }}
      </div>
    </div>

    <!-- 平均响应 -->
    <div class="rounded-xl2 bg-card p-[22px] shadow-soft">
      <div class="mb-4 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
        {{ $t('dashboard.kpi.avgResponse') }}
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
