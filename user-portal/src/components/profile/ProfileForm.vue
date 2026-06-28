<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { User } from '@/api/types'
import { compressToDataUrl } from '@/utils/avatar'

const { t } = useI18n()
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
    uploadError.value = err instanceof Error ? err.message : t('profile.form.uploadFailed')
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
      {{ $t('profile.form.title') }}
    </h3>
    <p class="mb-[24px] text-[13px] text-subtle">
      {{ $t('profile.form.subtitle') }}
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
            {{ $t('profile.form.avatarLabel') }}
          </div>
          <div class="mb-[12px] text-[12px] leading-[1.5] text-[#A8A49A]">
            {{ $t('profile.form.avatarHint') }}
          </div>
          <div class="flex gap-[8px]">
            <button
              class="cursor-pointer rounded-[9px] border-[1.5px] border-border2 bg-card px-[14px] py-[7px] text-[12px] font-medium text-text transition-colors hover:border-accent hover:text-accent"
              type="button"
              @click="openFilePicker"
            >
              {{ $t('profile.form.uploadImage') }}
            </button>
            <button
              class="cursor-pointer rounded-[9px] border-[1.5px] border-border2 bg-card px-[14px] py-[7px] text-[12px] font-medium text-text2 transition-colors hover:text-neg"
              type="button"
              @click="emit('remove-avatar')"
            >
              {{ $t('common.delete') }}
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
          {{ $t('profile.form.username') }}
        </label>
        <input
          v-model="username"
          class="mb-[16px] w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-[border-color,box-shadow] focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
          type="text"
          maxlength="50"
          :placeholder="$t('profile.form.usernamePlaceholder')"
        >
        <div class="flex justify-end">
          <button
            class="cursor-pointer rounded-[10px] bg-accent px-[22px] py-[11px] text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(20,194,138,0.28)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            :disabled="username.trim().length < 1 || username.trim().length > 50"
            @click="onSaveUsername"
          >
            {{ $t('profile.form.updateProfile') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
