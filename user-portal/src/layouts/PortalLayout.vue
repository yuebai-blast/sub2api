<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { formatBalance } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const menuOpen = ref(false)
const toggleMenu = () => (menuOpen.value = !menuOpen.value)
const closeMenu = () => (menuOpen.value = false)

const tabs = [
  { name: 'Dashboard', label: '仪表盘', to: '/dashboard' },
  { name: 'Usage', label: '使用记录', to: '/usage' },
  { name: 'Keys', label: 'API 密钥', to: '/keys' }
]

const username = computed(() => authStore.user?.username || '用户')
const email = computed(() => authStore.user?.email || '')
const initial = computed(() => (username.value || '?').charAt(0).toUpperCase())
const isDark = computed(() => themeStore.mode === 'dark')

function go(path: string) {
  closeMenu()
  router.push(path)
}

async function handleLogout() {
  closeMenu()
  await authStore.logout()
  router.push('/login')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMenu()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

onMounted(() => {
  if (!authStore.user) authStore.fetchUser()
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <!-- ============ 顶栏 ============ -->
    <header
      class="sticky top-0 z-30 flex h-[66px] items-center gap-7 border-b border-border px-12 backdrop-blur-md"
      style="background: var(--bar)"
    >
      <!-- logo -->
      <div class="flex items-end gap-1.5">
        <span class="font-display text-[22px] font-semibold leading-none tracking-tight text-text">mint</span>
        <span class="mb-[3px] inline-block h-[7px] w-[7px] rounded-full bg-accent" />
        <span class="font-display text-[22px] font-semibold leading-none tracking-wide text-text">AI</span>
      </div>

      <!-- 导航 tabs -->
      <nav class="flex items-center gap-1">
        <router-link
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          class="tab"
          active-class="tab-on"
        >
          {{ tab.label }}
        </router-link>
      </nav>

      <!-- 用户菜单 -->
      <div class="relative ml-auto">
        <button
          class="flex items-center gap-2.5 rounded-full border border-border bg-card py-[5px] pl-3.5 pr-1.5 shadow-pill"
          @click="toggleMenu"
        >
          <span class="whitespace-nowrap text-[13px] font-medium text-mtext">{{ username }}</span>
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white"
          >
            {{ initial }}
          </span>
        </button>

        <template v-if="menuOpen">
          <div
            class="fixed inset-0 z-40"
            @click="closeMenu"
          />
          <div
            class="absolute right-0 top-[54px] z-50 w-[268px] rounded-2xl border border-border bg-card p-2 shadow-menu"
          >
            <!-- 用户信息 -->
            <div class="flex items-center gap-3 px-3 pb-3.5 pt-3">
              <span
                class="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-accent text-base font-semibold text-white"
              >
                {{ initial }}
              </span>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-text">
                  {{ username }}
                </div>
                <div class="truncate text-xs text-subtle">
                  {{ email }}
                </div>
              </div>
            </div>

            <!-- 余额 -->
            <div class="mx-3 mb-2 flex items-center justify-between rounded-[11px] bg-muted px-3.5 py-[11px]">
              <span class="whitespace-nowrap text-xs font-medium text-subtle">账户余额</span>
              <span class="num text-[17px] font-medium text-text">${{ formatBalance(authStore.balance) }}</span>
            </div>

            <div class="mx-1.5 my-1 h-px bg-track" />

            <a
              class="mi font-semibold text-accent"
              @click="go('/recharge')"
            >充值<span class="text-accent">→</span></a>
            <a
              class="mi"
              @click="go('/orders')"
            >我的订单<span>→</span></a>
            <a
              class="mi"
              @click="go('/profile')"
            >个人资料<span>→</span></a>

            <div class="mx-1.5 my-1.5 h-px bg-track" />

            <a
              class="mi text-mtext"
              @click="themeStore.toggle()"
            >
              {{ isDark ? '浅色模式' : '深色模式' }}<span>{{ isDark ? '☀' : '☾' }}</span>
            </a>
            <a
              class="mi text-neg"
              @click="handleLogout"
            >退出登录<span class="text-neg">↪</span></a>
          </div>
        </template>
      </div>
    </header>

    <!-- ============ 主体 ============ -->
    <main class="min-w-0 flex-1 px-12 py-11">
      <div class="mx-auto max-w-[1240px]">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.tab {
  font: 500 14px 'Space Grotesk', sans-serif;
  padding: 8px 14px;
  border-radius: 10px;
  color: var(--text2);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.15s,
    color 0.15s;
}
.tab:hover {
  background: var(--muted);
}
.tab-on {
  background: var(--card);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
}
.mi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 9px;
  font: 500 13px 'Space Grotesk';
  color: var(--mtext);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.12s;
}
.mi:hover {
  background: var(--muted);
}
.mi span:last-child {
  color: #c0bcb2;
  font-size: 13px;
}
</style>
