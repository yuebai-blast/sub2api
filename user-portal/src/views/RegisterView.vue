<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as authApi from '@/api/auth'
import { updateProfile } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import type { PublicSettings } from '@/api/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const invitation = ref('')
const verifyCode = ref('')
const agreed = ref(true)

const settings = ref<PublicSettings | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const sending = ref(false)
const countdown = ref(0)

onMounted(async () => {
  try {
    settings.value = await authApi.getPublicSettings()
  } catch {
    // 拉取失败时按最常见配置（无邀请码 / 无邮箱验证）兜底
  }
})

async function sendCode() {
  if (!email.value) {
    error.value = '请先填写邮箱'
    return
  }
  sending.value = true
  error.value = null
  try {
    await authApi.sendVerifyCode(email.value)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    error.value = (e as { message?: string }).message || '验证码发送失败'
  } finally {
    sending.value = false
  }
}

async function onSubmit() {
  if (!email.value || !password.value) {
    error.value = '请填写邮箱和密码'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  if (password.value !== confirm.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (!agreed.value) {
    error.value = '请先阅读并同意服务条款与隐私政策'
    return
  }
  loading.value = true
  error.value = null
  try {
    await authApi.register({
      email: email.value,
      password: password.value,
      verify_code: settings.value?.email_verify_enabled ? verifyCode.value : undefined,
      invitation_code: invitation.value || undefined
    })
    // 后端由邮箱派生用户名，若填写了昵称则注册后补充资料
    if (username.value.trim()) {
      try {
        await updateProfile({ username: username.value.trim() })
      } catch {
        // 资料补充失败不阻断注册成功流程
      }
    }
    await authStore.fetchUser()
    router.push('/dashboard')
  } catch (e) {
    error.value = (e as { message?: string }).message || '注册失败，请稍后重试'
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
      <div
        class="pointer-events-none absolute -right-[90px] -top-[70px] h-[340px] w-[340px] opacity-50"
        style="background: linear-gradient(150deg, #0e9e72 0%, #14c28a 45%, rgba(20, 194, 138, 0) 92%); -webkit-mask-image: radial-gradient(#000 2px, transparent 2.2px); mask-image: radial-gradient(#000 2px, transparent 2.2px); -webkit-mask-size: 18px 18px; mask-size: 18px 18px;"
      />
      <div
        class="pointer-events-none absolute -bottom-20 -left-[70px] h-[260px] w-[260px] opacity-[0.06]"
        style="background: radial-gradient(#1a1a1a 1.7px, transparent 1.9px); background-size: 15px 15px;"
      />

      <div class="relative flex items-end gap-[7px]">
        <span class="font-display text-[28px] font-semibold leading-none tracking-tight text-text">mint</span>
        <span class="mb-1 inline-block h-[9px] w-[9px] rounded-full bg-accent" />
        <span class="font-display text-[28px] font-semibold leading-none tracking-wide text-text">AI</span>
      </div>

      <div class="relative max-w-[420px]">
        <div class="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-pos">
          3 分钟 · 即刻开通
        </div>
        <h2 class="font-serif text-[42px] font-medium leading-[1.12] tracking-tight text-text">
          注册即送<br><span class="relative whitespace-nowrap">体验额度<span
            class="absolute inset-x-0 bottom-0.5 -z-10 h-[9px] rounded-sm bg-accent opacity-[0.28]"
          /></span>，<br>无需绑卡。
        </h2>
        <p class="mt-5 text-[15px] leading-relaxed text-text3">
          创建一个 API 密钥即可调用全部已接入模型，按实际使用量计费，团队用量一目了然。
        </p>
      </div>

      <!-- 步骤 -->
      <div class="relative flex flex-col gap-3.5">
        <div class="flex items-center gap-[13px]">
          <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-accent text-[13px] font-semibold text-white">1</span>
          <span class="text-sm font-medium text-text2">创建账户</span>
        </div>
        <div class="flex items-center gap-[13px]">
          <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border-[1.5px] border-border2 bg-card text-[13px] font-semibold text-subtle">2</span>
          <span class="text-sm font-medium text-subtle">生成 API 密钥</span>
        </div>
        <div class="flex items-center gap-[13px]">
          <span class="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border-[1.5px] border-border2 bg-card text-[13px] font-semibold text-subtle">3</span>
          <span class="text-sm font-medium text-subtle">开始调用</span>
        </div>
      </div>
    </div>

    <!-- ============ 右侧表单 ============ -->
    <div class="flex min-w-0 flex-1 items-center justify-center bg-bg px-10 py-12">
      <div class="w-full max-w-[392px]">
        <div class="mb-[30px]">
          <h1 class="mb-2 font-serif text-4xl font-medium tracking-tight text-text">
            创建账户
          </h1>
          <p class="text-sm text-subtle">
            填写以下信息，开启你的 Mint AI。
          </p>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="mb-4">
            <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">用户名</label>
            <div class="relative">
              <svg
                class="ico"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              ><circle
                cx="12"
                cy="8"
                r="4"
              /><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /></svg>
              <input
                v-model="username"
                type="text"
                class="fld"
                placeholder="给自己起个名字"
              >
            </div>
          </div>

          <div class="mb-4">
            <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">邮箱</label>
            <div class="relative">
              <svg
                class="ico"
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
                v-model="email"
                type="email"
                class="fld"
                placeholder="you@example.com"
              >
            </div>
          </div>

          <!-- 邮箱验证码（仅在站点开启邮箱验证时显示） -->
          <div
            v-if="settings?.email_verify_enabled"
            class="mb-4"
          >
            <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">邮箱验证码</label>
            <div class="flex gap-2">
              <input
                v-model="verifyCode"
                type="text"
                class="fld !pl-4"
                placeholder="6 位验证码"
              >
              <button
                type="button"
                :disabled="sending || countdown > 0"
                class="flex-none whitespace-nowrap rounded-xl2 border-[1.5px] border-border2 px-3.5 text-[13px] font-medium text-text2 disabled:opacity-50"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </button>
            </div>
          </div>

          <div class="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">密码</label>
              <div class="relative">
                <svg
                  class="ico"
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
                  class="fld"
                  placeholder="至少 6 位"
                >
              </div>
            </div>
            <div>
              <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">确认密码</label>
              <div class="relative">
                <svg
                  class="ico"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.7"
                ><path d="M5 13l4 4 10-10" /></svg>
                <input
                  v-model="confirm"
                  type="password"
                  class="fld"
                  placeholder="再输一次"
                >
              </div>
            </div>
          </div>

          <div
            v-if="settings?.invitation_code_enabled !== false"
            class="mb-[22px]"
          >
            <label class="mb-[9px] block text-xs font-semibold tracking-wide text-text2">邀请码 <span class="font-normal text-faint">· 选填</span></label>
            <div class="relative">
              <svg
                class="ico"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
              ><rect
                x="3"
                y="8"
                width="18"
                height="13"
                rx="2"
              /><path d="M3 12h18M12 8V5a2 2 0 0 1 4 0M12 8V5a2 2 0 0 0-4 0" /></svg>
              <input
                v-model="invitation"
                type="text"
                class="fld"
                placeholder="有邀请码可享额外额度"
              >
            </div>
          </div>

          <label class="mb-[22px] flex cursor-pointer items-start gap-[9px] text-[13px] leading-snug text-text3">
            <input
              v-model="agreed"
              type="checkbox"
              class="mt-0.5 h-[17px] w-[17px] flex-none rounded-[5px] accent-accent"
            >
            <span>我已阅读并同意 <span class="font-semibold text-text">服务条款</span> 与 <span class="font-semibold text-text">隐私政策</span></span>
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
            <span>{{ loading ? '创建中…' : '创建账户' }}</span>
            <span
              v-if="!loading"
              class="text-base"
            >→</span>
          </button>
        </form>

        <p class="mt-[26px] text-center text-sm text-subtle">
          已有账户？<router-link
            to="/login"
            class="border-b-2 border-accent pb-px font-semibold text-text"
          >
            直接登录
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
.ico {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--faint);
  pointer-events: none;
}
</style>
