<script setup lang="ts">
import { computed } from 'vue'
import type { PlatformDashboardStats } from '@/api/types'
import { formatNumber, percent } from '@/utils/format'

const props = defineProps<{ byPlatform: PlatformDashboardStats[] }>()

// 固定 4 宫格面板样式（薄荷主调 / 标准强度），顺序：Claude / GPT / Gemini / 其他
interface Panel {
  key: string
  name: string
  bg: string
  text: string
  nameColor: string
  subColor: string
  dotColor: string
  dotOpacity: number
}

const PANELS: Panel[] = [
  { key: 'anthropic', name: 'Claude', bg: '#F0ECE0', text: '#1A1A1A', nameColor: '#1A1A1A', subColor: '#6E6A60', dotColor: '#1A1A1A', dotOpacity: 0.07 },
  { key: 'openai', name: 'GPT', bg: '#14C28A', text: '#ffffff', nameColor: '#063A2B', subColor: 'rgba(255,255,255,.85)', dotColor: '#0A4A38', dotOpacity: 0.16 },
  { key: 'gemini', name: 'Gemini', bg: '#0E8F66', text: '#ffffff', nameColor: '#ffffff', subColor: 'rgba(255,255,255,.85)', dotColor: '#063A2B', dotOpacity: 0.16 },
  { key: '__other__', name: '其他', bg: '#1A1A1A', text: '#ffffff', nameColor: '#F0ECE0', subColor: 'rgba(255,255,255,.6)', dotColor: '#ffffff', dotOpacity: 0.08 }
]

const KNOWN = new Set(['anthropic', 'openai', 'gemini'])

const cells = computed(() => {
  const map = new Map<string, number>()
  let total = 0
  for (const p of props.byPlatform || []) {
    const req = p.total_requests || 0
    total += req
    if (KNOWN.has(p.platform)) {
      map.set(p.platform, (map.get(p.platform) || 0) + req)
    } else {
      map.set('__other__', (map.get('__other__') || 0) + req)
    }
  }
  return PANELS.map((panel) => {
    const req = map.get(panel.key) || 0
    return { ...panel, requests: req, pct: percent(req, total) }
  })
})
</script>

<template>
  <div class="flex flex-col">
    <div class="mb-3.5 flex items-baseline justify-between">
      <h3 class="font-serif text-xl font-medium text-text">
        模型厂商分布
      </h3>
      <span class="text-xs font-medium text-subtle">近 7 天 · 按请求数</span>
    </div>
    <div class="grid flex-1 grid-cols-2 overflow-hidden rounded-xl3 shadow-card">
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="relative flex min-h-[170px] flex-col justify-between overflow-hidden px-6 py-[26px]"
        :style="{ background: cell.bg }"
      >
        <div
          class="pointer-events-none absolute inset-0"
          :style="{
            color: cell.dotColor,
            backgroundImage: 'radial-gradient(currentColor 1.6px, transparent 1.8px)',
            backgroundSize: '13px 13px',
            opacity: cell.dotOpacity
          }"
        />
        <div
          class="relative text-[13px] font-semibold"
          :style="{ color: cell.nameColor }"
        >
          {{ cell.name }}
        </div>
        <div class="relative">
          <div
            class="num text-[44px] font-medium leading-[0.9]"
            :style="{ color: cell.text }"
          >
            {{ formatNumber(cell.requests) }}
          </div>
          <div
            class="mt-2 text-xs font-medium"
            :style="{ color: cell.subColor }"
          >
            {{ cell.pct }}% · 请求
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
