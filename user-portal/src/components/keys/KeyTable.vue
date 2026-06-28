<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { maskApiKey, formatCost } from '@/utils/format'
import type { ApiKey, ApiKeyUsageStat } from '@/api/types'

defineProps<{
  rows: ApiKey[]
  usage: Record<string, ApiKeyUsageStat>
}>()

const emit = defineEmits<{
  edit: [key: ApiKey]
  toggle: [key: ApiKey]
  remove: [key: ApiKey]
  copy: [key: ApiKey]
}>()

function platformDot(platform: string | undefined): string {
  if (!platform) return 'bg-ink'
  const p = platform.toLowerCase()
  if (p === 'claude' || p === 'anthropic') return 'bg-[#D8362C]'
  if (p === 'gpt' || p === 'openai') return 'bg-[#14C28A]'
  return 'bg-ink'
}
</script>

<template>
  <div class="overflow-hidden rounded-xl3 bg-card shadow-card">
    <!-- 表头 -->
    <div
      class="grid grid-cols-[1.4fr_1.5fr_1fr_1.3fr_0.9fr_1.7fr] gap-4 border-b border-track px-[26px] py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint"
    >
      <div>{{ $t('keys.table.nameKey') }}</div>
      <div>{{ $t('keys.table.group') }}</div>
      <div>{{ $t('keys.table.status') }}</div>
      <div>{{ $t('keys.table.usage') }}</div>
      <div>{{ $t('keys.table.rate') }}</div>
      <div class="text-right">
        {{ $t('keys.table.actions') }}
      </div>
    </div>

    <!-- 数据行 -->
    <div
      v-for="row in rows"
      :key="row.id"
      class="grid grid-cols-[1.4fr_1.5fr_1fr_1.3fr_0.9fr_1.7fr] items-center gap-4 border-b border-rowline px-[26px] py-5 transition-colors hover:bg-hover"
      :class="row.status === 'inactive' ? 'opacity-[0.72]' : ''"
    >
      <!-- 名称 · 密钥 -->
      <div>
        <div class="mb-[5px] text-sm font-semibold text-text">
          {{ row.name }}
        </div>
        <div
          class="inline-flex cursor-pointer items-center gap-[7px] rounded-[7px] bg-muted px-[9px] py-1 text-xs font-medium text-text3"
          @click="emit('copy', row)"
        >
          {{ maskApiKey(row.key) }}
          <span class="text-accent">⧉</span>
        </div>
      </div>

      <!-- 分组 -->
      <div>
        <span
          v-if="row.group"
          class="inline-flex items-center gap-1.5 text-[13px] font-medium text-text"
        >
          <span
            class="inline-block h-[7px] w-[7px] rounded-full"
            :class="platformDot(row.group.platform)"
          />
          {{ row.group.name }}
          <span class="rounded-[5px] bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-faint">
            {{ row.group.rate_multiplier ?? 1 }}x
          </span>
        </span>
        <span
          v-else
          class="text-[13px] text-subtle"
        >—</span>
      </div>

      <!-- 状态 -->
      <div>
        <StatusBadge
          :variant="row.status === 'active' ? 'active' : 'inactive'"
          :label="row.status === 'active' ? $t('keys.status.active') : $t('keys.status.inactive')"
        />
      </div>

      <!-- 用量 -->
      <div class="text-[13px] leading-relaxed text-text3">
        {{ $t('keys.table.today') }} <b class="font-semibold text-text">${{ formatCost(usage[String(row.id)]?.today_actual_cost ?? 0) }}</b><br>
        {{ $t('keys.table.last30d') }} <b class="font-semibold text-text">${{ formatCost(usage[String(row.id)]?.total_actual_cost ?? 0) }}</b>
      </div>

      <!-- 速率 -->
      <div class="text-[13px] font-medium text-text2">
        {{ row.rate_limit_1d ? $t('keys.table.ratePerDay', { n: row.rate_limit_1d }) : '—' }}
      </div>

      <!-- 操作 -->
      <div class="flex flex-wrap justify-end gap-0.5">
        <button
          class="inline-flex cursor-pointer items-center gap-[5px] rounded-lg px-[9px] py-[6px] text-xs font-medium text-text3 transition-colors hover:bg-muted hover:text-text"
          @click="emit('copy', row)"
        >
          {{ $t('keys.table.use') }}
        </button>
        <button
          class="inline-flex cursor-pointer items-center gap-[5px] rounded-lg px-[9px] py-[6px] text-xs font-medium text-text3 transition-colors hover:bg-muted hover:text-text"
          @click="emit('edit', row)"
        >
          {{ $t('common.edit') }}
        </button>
        <button
          class="inline-flex cursor-pointer items-center gap-[5px] rounded-lg px-[9px] py-[6px] text-xs font-medium transition-colors hover:bg-muted"
          :class="row.status === 'active' ? 'text-text3 hover:text-text' : 'text-pos hover:text-pos'"
          @click="emit('toggle', row)"
        >
          {{ row.status === 'active' ? $t('keys.disable') : $t('keys.enable') }}
        </button>
        <button
          class="inline-flex cursor-pointer items-center gap-[5px] rounded-lg px-[9px] py-[6px] text-xs font-medium text-neg transition-colors hover:bg-muted"
          @click="emit('remove', row)"
        >
          {{ $t('common.delete') }}
        </button>
      </div>
    </div>

    <!-- 空态 -->
    <div
      v-if="rows.length === 0"
      class="px-[26px] py-16 text-center text-sm text-subtle"
    >
      {{ $t('keys.empty') }}
    </div>
  </div>
</template>
