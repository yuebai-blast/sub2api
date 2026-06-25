<script setup lang="ts">
import { onMounted } from 'vue'
import PortalLayout from '@/layouts/PortalLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import Pagination from '@/components/ui/Pagination.vue'
import UsageLogTable from '@/components/usage/UsageLogTable.vue'
import { useUsage } from '@/composables/useUsage'
import { downloadCsv } from '@/utils/csv'
import {
  formatTokens,
  formatCost,
  formatDuration,
  formatDateTime,
  formatReasoningEffort,
  cacheHitRate,
  toLocalDate,
} from '@/utils/format'

const {
  rows,
  total,
  page,
  pageSize,
  stats,
  keys,
  filters,
  loading,
  error,
  loaded,
  load,
  loadKeys,
  setPage,
  fetchForExport,
} = useUsage()

onMounted(async () => {
  await Promise.all([load(), loadKeys()])
})

function resetPageAndLoad() {
  page.value = 1
  load()
}

function handleReset() {
  filters.api_key_id = ''
  filters.start_date = toLocalDate(new Date(Date.now() - 6 * 86_400_000))
  filters.end_date = toLocalDate(new Date())
  page.value = 1
  load()
}

async function handleExport() {
  const data = await fetchForExport()
  const headers = ['密钥', '模型', '强度', '端点', '流式', '计费', 'input_tokens', 'output_tokens', 'cache_tokens', 'created_at', 'actual_cost']
  const rowsData = data.map((r) => [
    r.api_key?.name ?? '',
    r.model,
    formatReasoningEffort(r.reasoning_effort),
    r.inbound_endpoint ?? '',
    r.stream ? '是' : '否',
    String(r.billing_type),
    r.input_tokens,
    r.output_tokens,
    r.cache_read_tokens,
    formatDateTime(r.created_at),
    r.actual_cost,
  ])
  downloadCsv('usage.csv', headers, rowsData)
}

// KPI 计算
function kpiTokenHint(s: NonNullable<typeof stats.value>): string {
  const rate = cacheHitRate(s.total_tokens > 0 ? s.total_tokens - s.total_input_tokens - s.total_output_tokens : 0, s.total_input_tokens)
  return `入 ${formatTokens(s.total_input_tokens)} · 出 ${formatTokens(s.total_output_tokens)} · 缓存命中 ${formatTokens(s.total_tokens - s.total_input_tokens - s.total_output_tokens)}\n命中率 ${rate.toFixed(1)}%`
}
</script>

<template>
  <PortalLayout>
    <!-- 页头 -->
    <PageHeader
      title="使用记录"
      subtitle="查看和分析您的 API 使用历史。"
    >
      <template #actions>
        <button
          class="rounded-full bg-card px-4 py-[11px] text-[13px] font-medium text-text2 shadow-pill transition-colors hover:text-text"
          :disabled="loading"
          @click="load()"
        >
          ↻ 刷新
        </button>
        <button
          class="rounded-full bg-card px-4 py-[11px] text-[13px] font-medium text-text2 shadow-pill transition-colors hover:text-text"
          @click="handleReset"
        >
          重置
        </button>
        <button
          class="rounded-full bg-accent px-[22px] py-[11px] text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(20,194,138,.3)] transition-opacity hover:opacity-90"
          @click="handleExport"
        >
          ↓ 导出 CSV
        </button>
      </template>
    </PageHeader>

    <!-- 加载态（首次） -->
    <LoadingSpinner
      v-if="loading && !loaded"
      :size="32"
    />

    <!-- 错误态（首次） -->
    <div
      v-else-if="error && !loaded"
      class="rounded-xl3 border border-dashed border-border2 bg-card px-7 py-16 text-center text-sm text-subtle"
    >
      {{ error }}
      <button
        class="ml-2 underline"
        @click="load()"
      >
        重试
      </button>
    </div>

    <template v-else>
      <!-- KPI 卡片 -->
      <div class="mb-[22px] grid grid-cols-2 gap-[18px] lg:grid-cols-4">
        <StatCard
          label="总请求数"
          :value="stats ? String(stats.total_requests) : '—'"
          hint="所选范围内"
        />
        <StatCard
          label="总 Token"
          :value="stats ? formatTokens(stats.total_tokens) : '—'"
          :hint="stats ? kpiTokenHint(stats) : undefined"
        />
        <StatCard
          label="总消费"
          :value="stats ? `$${formatCost(stats.total_actual_cost)}` : '—'"
          :hint="stats ? `实际 / 标准 $${formatCost(stats.total_cost)}` : undefined"
          accent
        />
        <StatCard
          label="平均耗时"
          :value="stats ? formatDuration(stats.average_duration_ms) : '—'"
          hint="每次请求"
        />
      </div>

      <!-- 筛选栏 -->
      <FilterBar>
        <div>
          <div class="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
            API 密钥
          </div>
          <select
            v-model="filters.api_key_id"
            class="rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
            @change="resetPageAndLoad"
          >
            <option value="">
              全部密钥
            </option>
            <option
              v-for="k in keys"
              :key="k.id"
              :value="k.id"
            >
              {{ k.name }}
            </option>
          </select>
        </div>

        <div>
          <div class="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
            开始日期
          </div>
          <input
            v-model="filters.start_date"
            type="date"
            class="rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
            @change="resetPageAndLoad"
          >
        </div>

        <div>
          <div class="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
            结束日期
          </div>
          <input
            v-model="filters.end_date"
            type="date"
            class="rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
            @change="resetPageAndLoad"
          >
        </div>
      </FilterBar>

      <!-- 表格卡片 -->
      <div class="overflow-hidden rounded-[18px] bg-card shadow-[0_2px_12px_rgba(0,0,0,.04)]">
        <!-- 加载中遮罩 -->
        <div
          v-if="loading && loaded"
          class="flex items-center justify-center py-16"
        >
          <LoadingSpinner :size="24" />
        </div>

        <!-- 错误（非首次） -->
        <div
          v-else-if="error && loaded"
          class="px-[26px] py-12 text-center text-sm text-subtle"
        >
          {{ error }}
          <button
            class="ml-2 underline"
            @click="load()"
          >
            重试
          </button>
        </div>

        <!-- 表格 -->
        <UsageLogTable
          v-else
          :rows="rows"
        />

        <!-- 分页 -->
        <Pagination
          :page="page"
          :page-size="pageSize"
          :total="total"
          @update:page="setPage"
        />
      </div>
    </template>
  </PortalLayout>
</template>
