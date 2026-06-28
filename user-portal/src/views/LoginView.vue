<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const account = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  if (!account.value || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }
  loading.value = true
  error.value = null
  try {
    await authStore.login(account.value, password.value)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (e) {
    const err = e as { message?: string }
    error.value = err.message || '登录失败，请检查邮箱和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen font-sans">
    <!-- ============ 左侧品牌区 ============ -->
    <div
      class="relative hidden w-[46%] flex-none flex-col justify-between overflow-hidden border-r border-border bg-muted px-14 py-[54px] lg:flex"
    >
      <!-- warhol 点阵晕染 -->
      <div
        class="pointer-events-none absolute -right-[90px] -top-[70px] h-[340px] w-[340px] opacity-50"
        style="background: linear-gradient(150deg, #0e9e72 0%, #14c28a 45%, rgba(20, 194, 138, 0) 92%); -webkit-mask-image: radial-gradient(#000 2px, transparent 2.2px); mask-image: radial-gradient(#000 2px, transparent 2.2px); -webkit-mask-size: 18px 18px; mask-size: 18px 18px;"
      />
      <div
        class="pointer-events-none absolute -bottom-20 -left-[70px] h-[260px] w-[260px] opacity-[0.06]"
        style="background: radial-gradient(#1a1a1a 1.7px, transparent 1.9px); background-size: 15px 15px;"
      />

      <!-- 字标 -->
      <div class="relative flex items-center">
        <img
          src="/wordmark-dark.png"
          alt="MintPop API"
          class="block h-8 w-auto dark:hidden"
        >
        <img
          src="/wordmark-light.png"
          alt="MintPop API"
          class="hidden h-8 w-auto dark:block"
        >
      </div>

      <!-- 编辑式标语 -->
      <div class="relative max-w-[420px]">
        <div class="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-pos">
          一个 API · 多种模型
        </div>
        <h2 class="font-serif text-[42px] font-medium leading-[1.12] tracking-tight text-text">
          把订阅<br>变成你的<span class="relative whitespace-nowrap"> API 接口<span
            class="absolute inset-x-0 bottom-0.5 -z-10 h-[9px] rounded-sm bg-accent opacity-[0.28]"
          /></span>。
        </h2>
        <p class="mt-5 text-[15px] leading-relaxed text-text3">
          Claude、GPT、Gemini 同一把密钥统一调用，按量计费，会话保持，告别频繁报错。
        </p>
      </div>

      <!-- 模型标签 -->
      <div class="relative flex flex-wrap gap-2.5">
        <span class="rounded-full border border-border bg-card px-3.5 py-[7px] text-xs font-medium text-text2">● Claude</span>
        <span class="rounded-full border border-border bg-card px-3.5 py-[7px] text-xs font-medium text-text2">● GPT</span>
        <span class="rounded-full border border-border bg-card px-3.5 py-[7px] text-xs font-medium text-text2">● Gemini</span>
        <span class="rounded-full border border-dashed border-border2 px-3.5 py-[7px] text-xs font-medium text-faint">更多即将推出</span>
      </div>
    </div>

    <!-- ============ 右侧表单 ============ -->
    <div class="flex min-w-0 flex-1 items-center justify-center bg-bg px-10 py-12">
      <div class="w-full max-w-[392px]">
        <!-- 移动端字标 -->
        <div class="mb-8 flex items-center lg:hidden">
          <img
            src="/wordmark-dark.png"
            alt="MintPop API"
            class="block h-7 w-auto dark:hidden"
          >
          <img
            src="/wordmark-light.png"
            alt="MintPop API"
            class="hidden h-7 w-auto dark:block"
          >
        </div>

        <div class="mb-8">
          <h1 class="mb-2 font-serif text-4xl font-medium tracking-tight text-text">
            欢迎回来
          </h1>
          <p class="text-sm text-subtle">
            登录您的账户以继续使用控制台。
          </p>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="mb-[18px]">
            <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">邮箱</label>
            <div class="relative">
              <svg
                class="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-faint"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              ><rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2.5"
              /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
              <input
                v-model="account"
                type="text"
                autocomplete="username"
                class="fld"
                placeholder="you@example.com"
              >
            </div>
          </div>

          <div class="mb-[14px]">
            <div class="mb-[9px] flex items-baseline justify-between">
              <label class="text-xs font-semibold tracking-wide text-text2">密码</label>
              <span class="cursor-pointer text-xs font-medium text-neg">忘记密码？</span>
            </div>
            <div class="relative">
              <svg
                class="pointer-events-none absolute left-[15px] top-1/2 -translate-y-1/2 text-faint"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              ><rect
                x="4"
                y="11"
                width="16"
                height="9"
                rx="2"
              /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              <input
                v-model="password"
                type="password"
                autocomplete="current-password"
                class="fld"
                placeholder="请输入密码"
              >
            </div>
          </div>

          <label class="mb-[26px] flex cursor-pointer items-center gap-[9px] text-[13px] text-text3">
            <input
              v-model="remember"
              type="checkbox"
              class="h-[17px] w-[17px] rounded-[5px] accent-accent"
            >
            记住此设备
          </label>

          <p
            v-if="error"
            class="mb-4 text-sm text-neg"
          >
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center gap-2 rounded-xl2 bg-accent py-[15px] text-[15px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            style="box-shadow: 0 4px 14px rgba(20, 194, 138, 0.32)"
          >
            <LoadingSpinner
              v-if="loading"
              :size="16"
            />
            <span>{{ loading ? '登录中…' : '登录' }}</span>
            <span
              v-if="!loading"
              class="text-base"
            >→</span>
          </button>
        </form>

        <p class="mt-[30px] text-center text-sm text-subtle">
          还没有账户？<router-link
            to="/register"
            class="border-b-2 border-accent pb-px font-semibold text-text"
          >
            免费注册
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fld {
  width: 100%;
  font: 400 15px 'Space Grotesk', sans-serif;
  color: var(--text);
  background: var(--card);
  border: 1.5px solid var(--border2);
  border-radius: 12px;
  padding: 14px 16px 14px 44px;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.fld::placeholder {
  color: var(--faint);
}
.fld:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(20, 194, 138, 0.13);
}
</style>
