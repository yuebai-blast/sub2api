<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ModelStat } from '@/api/types'
import { formatNumber, percent } from '@/utils/format'

const props = defineProps<{ models: ModelStat[] }>()

const { t } = useI18n()

// 调色板（与设计稿一致）：前 4 个有色，"其他"用灰
const COLORS = ['var(--accent)', 'var(--ink)', '#0E8F66', '#D8362C', '#B0ACA2']

interface Row {
  label: string
  requests: number
  color: string
  pct: number
}

const rows = computed<Row[]>(() => {
  const sorted = [...(props.models || [])].sort((a, b) => b.requests - a.requests)
  const total = sorted.reduce((s, m) => s + (m.requests || 0), 0)
  const top = sorted.slice(0, 4)
  const restReq = sorted.slice(4).reduce((s, m) => s + (m.requests || 0), 0)

  const list: Row[] = top.map((m, i) => ({
    label: m.model,
    requests: m.requests || 0,
    color: COLORS[i],
    pct: percent(m.requests || 0, total)
  }))
  if (restReq > 0) {
    list.push({ label: t('dashboard.model.other'), requests: restReq, color: COLORS[4], pct: percent(restReq, total) })
  }
  return list
})
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-3.5 flex items-baseline justify-between">
      <h3 class="font-serif text-xl font-medium text-text">
        {{ $t('dashboard.model.title') }}
      </h3>
      <span class="text-xs font-medium text-subtle">{{ $t('dashboard.model.subtitle') }}</span>
    </div>
    <div class="flex flex-1 flex-col justify-between gap-[18px] rounded-xl3 bg-card px-7 py-[26px] shadow-card">
      <p
        v-if="rows.length === 0"
        class="text-sm text-subtle"
      >
        {{ $t('common.noData') }}
      </p>
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex flex-col gap-[9px]"
      >
        <div class="flex items-baseline justify-between">
          <span class="flex items-center gap-[9px] text-[13px] font-semibold text-text">
            <span
              class="h-[9px] w-[9px] rounded-[3px]"
              :style="{ background: row.color }"
            />
            {{ row.label }}
          </span>
          <span class="text-xs text-subtle">
            <b class="num text-[15px] font-medium text-text">{{ formatNumber(row.requests) }}</b>
            &nbsp;{{ row.pct }}%
          </span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-[3px] bg-track">
          <div
            class="h-full rounded-[3px]"
            :style="{ width: `${row.pct}%`, background: row.color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
