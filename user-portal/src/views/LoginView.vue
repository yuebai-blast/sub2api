<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function onSubmit() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = null
  try {
    await authStore.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (e) {
    const err = e as { message?: string }
    error.value = err.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bg px-4">
    <div class="w-full max-w-[400px] rounded-xl4 bg-card p-9 shadow-card">
      <!-- logo -->
      <div class="mb-8 flex items-end justify-center gap-1.5">
        <span class="font-display text-2xl font-semibold leading-none tracking-tight text-text">mint</span>
        <span class="mb-1 inline-block h-2 w-2 rounded-full bg-accent" />
        <span class="font-display text-2xl font-semibold leading-none tracking-wide text-text">AI</span>
      </div>

      <h1 class="mb-1 text-center font-serif text-2xl font-medium text-text">
        登录
      </h1>
      <p class="mb-7 text-center text-sm text-subtle">
        登录以访问您的控制台
      </p>

      <form
        class="flex flex-col gap-4"
        @submit.prevent="onSubmit"
      >
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">用户名 / 邮箱</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            class="w-full rounded-xl2 border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            placeholder="请输入用户名或邮箱"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">密码</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-xl2 border border-border bg-muted px-4 py-3 text-sm text-text outline-none focus:border-accent"
            placeholder="请输入密码"
          >
        </div>

        <p
          v-if="error"
          class="text-sm text-neg"
        >
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-1 flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <LoadingSpinner
            v-if="loading"
            :size="16"
          />
          <span>{{ loading ? '登录中…' : '登录' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
