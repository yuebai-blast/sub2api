<script setup lang="ts">
import { onMounted } from 'vue'
import PortalLayout from '@/layouts/PortalLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import HeroBalance from '@/components/dashboard/HeroBalance.vue'
import KpiRow from '@/components/dashboard/KpiRow.vue'
import ModelDistribution from '@/components/dashboard/ModelDistribution.vue'
import VendorDistribution from '@/components/dashboard/VendorDistribution.vue'
import TrendChart from '@/components/dashboard/TrendChart.vue'
import LifetimeStrip from '@/components/dashboard/LifetimeStrip.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import { useDashboard } from '@/composables/useDashboard'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { stats, trend, models, loading, error, loadAll } = useDashboard()

onMounted(loadAll)
</script>

<template>
  <PortalLayout>
    <!-- 页头 -->
    <div class="mb-[34px] flex items-start justify-between">
      <div>
        <h1 class="mb-2 font-serif text-4xl font-medium tracking-tight text-text">
          {{ $t('dashboard.title') }}
        </h1>
        <p class="text-sm text-subtle">
          {{ $t('dashboard.welcome') }}
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <span class="rounded-full bg-card px-4 py-2.5 text-[13px] font-medium text-text2 shadow-pill">{{ $t('dashboard.last7Days') }}</span>
        <button
          class="rounded-full bg-card px-4 py-2.5 text-[13px] font-medium text-text2 shadow-pill hover:text-text"
          :disabled="loading"
          @click="loadAll"
        >
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- 加载态 -->
    <div
      v-if="loading && !stats"
      class="flex items-center justify-center py-24"
    >
      <LoadingSpinner :size="32" />
    </div>

    <!-- 错误态 -->
    <div
      v-else-if="error && !stats"
      class="rounded-xl3 border border-dashed border-border2 bg-card px-7 py-16 text-center"
    >
      <p class="text-sm text-subtle">
        {{ error }}
      </p>
      <button
        class="mt-4 rounded-full border border-text px-5 py-2 text-sm font-semibold text-text"
        @click="loadAll"
      >
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- 内容 -->
    <template v-else-if="stats">
      <HeroBalance
        :balance="authStore.balance"
        :today-cost="stats.today_actual_cost"
      />

      <KpiRow :stats="stats" />

      <div class="mb-[22px] grid grid-cols-1 gap-[22px] lg:grid-cols-2">
        <ModelDistribution :models="models" />
        <VendorDistribution :by-platform="stats.by_platform || []" />
      </div>

      <TrendChart :trend="trend" />

      <LifetimeStrip :stats="stats" />

      <QuickActions />
    </template>
  </PortalLayout>
</template>
