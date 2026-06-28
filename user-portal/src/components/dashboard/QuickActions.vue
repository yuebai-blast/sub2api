<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const actions = [
  { title: '创建 API 密钥', desc: '生成新的密钥', to: '/keys' },
  { title: '查看使用记录', desc: '详细使用日志', to: '/usage' },
  { title: '兑换码充值', desc: '使用兑换码', to: '/recharge#redeem' }
]

function go(to: string) {
  router.push(to)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
    <button
      v-for="a in actions"
      :key="a.title"
      class="flex items-center justify-between rounded-xl2 bg-card px-[22px] py-5 text-left shadow-soft transition hover:shadow-card"
      @click="go(a.to)"
    >
      <div>
        <div class="text-sm font-semibold text-text">
          {{ a.title }}
        </div>
        <div class="mt-1 text-xs text-subtle">
          {{ a.desc }}
        </div>
      </div>
      <span class="text-lg text-accent">→</span>
    </button>
  </div>
</template>
