<script setup lang="ts">
import PortalLayout from '@/layouts/PortalLayout.vue'

// 三个渠道的 Token 价格（单位：元 / 百万 tokens）。
// 配色与仪表盘「应用类型分布」面板一致：文本=米色 / 视觉=薄荷 / 语音=深绿。
interface Channel {
  key: 'text' | 'vision' | 'voice'
  input: number
  output: number
  bg: string
  nameColor: string
  numColor: string
  subColor: string
  dividerColor: string
  dotColor: string
  dotOpacity: number
}

// 价格由人民币按汇率 6.9 换算为美元，保留 2 位小数（单位：美元 / 百万 tokens）
const channels: Channel[] = [
  {
    key: 'text',
    input: 0.8,
    output: 3,
    bg: '#F0ECE0',
    nameColor: '#1A1A1A',
    numColor: '#1A1A1A',
    subColor: '#6E6A60',
    dividerColor: 'rgba(26,26,26,.10)',
    dotColor: '#1A1A1A',
    dotOpacity: 0.07
  },
  {
    key: 'vision',
    input: 1,
    output: 4.5,
    bg: '#14C28A',
    nameColor: '#063A2B',
    numColor: '#ffffff',
    subColor: 'rgba(255,255,255,.85)',
    dividerColor: 'rgba(255,255,255,.22)',
    dotColor: '#0A4A38',
    dotOpacity: 0.16
  },
  {
    key: 'voice',
    input: 0.9,
    output: 4,
    bg: '#0E8F66',
    nameColor: '#ffffff',
    numColor: '#ffffff',
    subColor: 'rgba(255,255,255,.85)',
    dividerColor: 'rgba(255,255,255,.22)',
    dotColor: '#063A2B',
    dotOpacity: 0.16
  }
]
</script>

<template>
  <PortalLayout>
    <!-- 页头 -->
    <div class="mb-[34px]">
      <h1 class="mb-2 font-serif text-4xl font-medium tracking-tight text-text">
        {{ $t('pricing.title') }}
      </h1>
      <p class="text-sm text-subtle">
        {{ $t('pricing.subtitle') }}
      </p>
    </div>

    <!-- 三渠道价格卡片 -->
    <div class="grid grid-cols-1 gap-[22px] md:grid-cols-3">
      <div
        v-for="ch in channels"
        :key="ch.key"
        class="relative overflow-hidden rounded-xl3 px-7 py-8 shadow-card"
        :style="{ background: ch.bg }"
      >
        <!-- 点阵装饰 -->
        <div
          class="pointer-events-none absolute inset-0"
          :style="{
            color: ch.dotColor,
            backgroundImage: 'radial-gradient(currentColor 1.6px, transparent 1.8px)',
            backgroundSize: '13px 13px',
            opacity: ch.dotOpacity
          }"
        />

        <!-- 渠道名 -->
        <div
          class="relative text-sm font-semibold uppercase tracking-[0.08em]"
          :style="{ color: ch.nameColor }"
        >
          {{ $t(`pricing.channel.${ch.key}`) }}
        </div>

        <!-- 输入 / 输出价格 -->
        <div class="relative mt-7 grid grid-cols-2 gap-4">
          <div>
            <div
              class="mb-2 text-xs font-medium"
              :style="{ color: ch.subColor }"
            >
              {{ $t('pricing.input') }}
            </div>
            <div
              class="num text-[40px] font-medium leading-none"
              :style="{ color: ch.numColor }"
            >
              {{ ch.input.toFixed(2) }}
            </div>
          </div>
          <div>
            <div
              class="mb-2 text-xs font-medium"
              :style="{ color: ch.subColor }"
            >
              {{ $t('pricing.output') }}
            </div>
            <div
              class="num text-[40px] font-medium leading-none"
              :style="{ color: ch.numColor }"
            >
              {{ ch.output.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- 计价单位 -->
        <div
          class="relative mt-7 border-t pt-3.5 text-xs font-medium"
          :style="{ borderColor: ch.dividerColor, color: ch.subColor }"
        >
          {{ $t('pricing.unit') }}
        </div>
      </div>
    </div>
  </PortalLayout>
</template>
