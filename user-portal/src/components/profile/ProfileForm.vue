<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '@/api/types'
import { compressToDataUrl } from '@/utils/avatar'

const props = defineProps<{ user: User }>()
const emit = defineEmits<{
  (e: 'save-username', name: string): void
  (e: 'upload', dataUrl: string): void
  (e: 'remove-avatar'): void
}>()

const username = ref(props.user.username)
const uploadError = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

/** 打开文件选择器 */
function openFilePicker() {
  fileInput.value?.click()
}

/** 文件选择后压缩并 emit upload */
async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadError.value = null
  try {
    const dataUrl = await compressToDataUrl(file)
    emit('upload', dataUrl)
  } catch (err) {
    uploadError.value = err instanceof Error ? err.message : '上传失败'
  } finally {
    // 重置 input，允许再次选同一文件
    if (fileInput.value) fileInput.value.value = ''
  }
}

/** 更新资料 */
function onSaveUsername() {
  const name = username.value.trim()
  if (name.length < 1 || name.length > 50) return
  emit('save-username', name)
}

/** 头像预览：优先用 avatar_url，无则首字 */
function avatarChar(u: User): string {
  return (u.username ?? u.email ?? '?').charAt(0).toUpperCase()
}
</script>

<template>
  <div class="mb-[22px] rounded-[18px] bg-card px-[30px] py-[28px] shadow-soft">
    <h3 class="mb-[4px] font-serif text-[20px] font-medium text-text">
      资料与头像
    </h3>
    <p class="mb-[24px] text-[13px] text-subtle">
      维护公开展示信息，保持头像与昵称风格一致。
    </p>

    <div class="grid grid-cols-2 items-start gap-[24px]">
      <!-- 头像区域 -->
      <div class="flex items-center gap-[18px]">
        <!-- 头像预览 -->
        <div
          class="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-[18px] font-serif text-[28px] font-semibold text-white"
          :style="
            props.user.avatar_url
              ? `background:url(${props.user.avatar_url}) center/cover no-repeat;font-size:0`
              : 'background:#14C28A'
          "
        >
          <span v-if="!props.user.avatar_url">{{ avatarChar(props.user) }}</span>
        </div>

        <div>
          <div class="mb-[5px] text-[14px] font-semibold text-text">
            资料头像
          </div>
          <div class="mb-[12px] text-[12px] leading-[1.5] text-[#A8A49A]">
            上传图片自动压缩静态图至 20KB 内，GIF 需自行控制在 20KB 内。
          </div>
          <div class="flex gap-[8px]">
            <button
              class="cursor-pointer rounded-[9px] border-[1.5px] border-border2 bg-card px-[14px] py-[7px] text-[12px] font-medium text-text transition-colors hover:border-accent hover:text-accent"
              type="button"
              @click="openFilePicker"
            >
              上传图片
            </button>
            <button
              class="cursor-pointer rounded-[9px] border-[1.5px] border-border2 bg-card px-[14px] py-[7px] text-[12px] font-medium text-text2 transition-colors hover:text-neg"
              type="button"
              @click="emit('remove-avatar')"
            >
              删除
            </button>
          </div>
          <p
            v-if="uploadError"
            class="mt-[8px] text-[12px] text-neg"
          >
            {{ uploadError }}
          </p>
          <!-- 隐藏的 file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          >
        </div>
      </div>

      <!-- 用户名编辑 -->
      <div>
        <label class="mb-[9px] block text-[12px] font-semibold uppercase tracking-[0.06em] text-text2">
          用户名
        </label>
        <input
          v-model="username"
          class="mb-[16px] w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
          type="text"
          maxlength="50"
          placeholder="用户名（1–50 字符）"
        >
        <div class="flex justify-end">
          <button
            class="cursor-pointer rounded-[10px] bg-accent px-[22px] py-[11px] text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(20,194,138,0.28)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            :disabled="username.trim().length < 1 || username.trim().length > 50"
            @click="onSaveUsername"
          >
            更新资料
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
