<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import type { Group, CreateApiKeyRequest, ApiKey } from '@/api/types'

const props = defineProps<{ open: boolean; groups: Group[] }>()
const emit = defineEmits<{
  close: []
  submit: [payload: CreateApiKeyRequest, done: (nk: ApiKey | null) => void]
}>()

const name = ref('')
const groupId = ref<number | null>(null)
const expiresInDays = ref<number | null>(null)
const quota = ref<number | null>(null)
const submitting = ref(false)
const createdKey = ref<ApiKey | null>(null)
const copied = ref(false)
const errorMsg = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      name.value = ''
      groupId.value = null
      expiresInDays.value = null
      quota.value = null
      createdKey.value = null
      copied.value = false
      submitting.value = false
      errorMsg.value = ''
    }
  }
)

function submit() {
  if (!name.value.trim() || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  emit(
    'submit',
    {
      name: name.value.trim(),
      group_id: groupId.value ?? undefined,
      expires_in_days: expiresInDays.value ?? undefined,
      quota: quota.value ?? undefined
    },
    (nk) => {
      submitting.value = false
      if (nk) {
        createdKey.value = nk
      } else {
        // 创建失败：保持表单，提示错误
        errorMsg.value = '创建失败，请重试'
      }
    }
  )
}

async function copyKey() {
  if (!createdKey.value) return
  try {
    await navigator.clipboard.writeText(createdKey.value.key)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch {
    // 忽略复制失败
  }
}
</script>

<template>
  <Modal
    :open="open"
    :title="createdKey ? '密钥已创建' : '创建密钥'"
    @close="emit('close')"
  >
    <!-- 步骤一：表单 -->
    <template v-if="!createdKey">
      <div class="flex flex-col gap-4">
        <!-- 名称 -->
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">名称 <span class="text-neg">*</span></label>
          <input
            v-model="name"
            type="text"
            placeholder="例如：生产环境"
            class="w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
            @keydown.enter="submit"
          >
        </div>

        <!-- 分组 -->
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">分组</label>
          <select
            v-model="groupId"
            class="w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
          >
            <option :value="null">
              不指定分组
            </option>
            <option
              v-for="g in groups"
              :key="g.id"
              :value="g.id"
            >
              {{ g.name }}
            </option>
          </select>
        </div>

        <!-- 有效期 -->
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">有效期（天，留空表示永不过期）</label>
          <input
            v-model.number="expiresInDays"
            type="number"
            min="1"
            placeholder="例如：30"
            class="w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
          >
        </div>

        <!-- 配额 -->
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">配额（USD，留空表示不限）</label>
          <input
            v-model.number="quota"
            type="number"
            min="0"
            step="0.01"
            placeholder="例如：10.00"
            class="w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
          >
        </div>

        <!-- 错误提示 -->
        <p
          v-if="errorMsg"
          class="text-xs text-neg"
        >
          {{ errorMsg }}
        </p>
      </div>
    </template>

    <!-- 步骤二：展示明文密钥 -->
    <template v-else>
      <div class="flex flex-col gap-4">
        <div class="rounded-xl2 border border-[#F59E0B]/40 bg-[#F59E0B]/[0.07] px-4 py-3 text-sm text-[#C77800]">
          请立即保存，关闭后不可再查看
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-text2">您的 API 密钥</label>
          <div class="flex items-center gap-2">
            <code
              class="flex-1 select-all overflow-x-auto rounded-xl2 border-[1.5px] border-border2 bg-muted px-4 py-3 text-xs font-medium text-text"
            >{{ createdKey.key }}</code>
            <button
              class="shrink-0 rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-xs font-medium text-text2 transition-colors hover:border-accent hover:text-accent"
              @click="copyKey"
            >
              {{ copied ? '已复制 ✓' : '复制' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <template v-if="!createdKey">
        <button
          class="rounded-full border border-border px-5 py-2 text-sm font-medium text-text2 transition-colors hover:border-border2 hover:text-text"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          class="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(20,194,138,.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
          :disabled="!name.trim() || submitting"
          @click="submit"
        >
          {{ submitting ? '创建中…' : '创建密钥' }}
        </button>
      </template>
      <template v-else>
        <button
          class="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(20,194,138,.3)] transition-opacity hover:opacity-90"
          @click="emit('close')"
        >
          完成
        </button>
      </template>
    </template>
  </Modal>
</template>
