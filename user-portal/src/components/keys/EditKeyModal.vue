<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import type { ApiKey, Group, UpdateApiKeyRequest } from '@/api/types'

const props = defineProps<{
  open: boolean
  target: ApiKey | null
  groups: Group[]
}>()

const emit = defineEmits<{
  close: []
  submit: [id: number, patch: UpdateApiKeyRequest]
}>()

const name = ref('')
const groupId = ref<number | null>(null)
const status = ref<'active' | 'inactive'>('active')
const submitting = ref(false)

watch(
  () => props.target,
  (t) => {
    if (t) {
      name.value = t.name
      groupId.value = t.group_id
      status.value = t.status === 'active' ? 'active' : 'inactive'
    }
  },
  { immediate: true }
)

watch(
  () => props.open,
  (v) => {
    if (!v) submitting.value = false
  }
)

function submit() {
  if (!props.target || !name.value.trim() || submitting.value) return
  submitting.value = true
  emit('submit', props.target.id, {
    name: name.value.trim(),
    status: status.value,
    // 「不指定分组」对应 null，确保清除分组也能持久化
    group_id: groupId.value
  })
}
</script>

<template>
  <Modal
    :open="open"
    title="编辑密钥"
    @close="emit('close')"
  >
    <div class="flex flex-col gap-4">
      <!-- 名称 -->
      <div>
        <label class="mb-1.5 block text-xs font-medium text-text2">名称 <span class="text-neg">*</span></label>
        <input
          v-model="name"
          type="text"
          placeholder="密钥名称"
          class="w-full rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_rgba(20,194,138,0.13)]"
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

      <!-- 启用开关 -->
      <div class="flex items-center justify-between rounded-xl2 border-[1.5px] border-border2 bg-card px-4 py-3">
        <span class="text-sm font-medium text-text2">启用密钥</span>
        <button
          type="button"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors"
          :class="status === 'active' ? 'bg-accent' : 'bg-track'"
          @click="status = status === 'active' ? 'inactive' : 'active'"
        >
          <span
            class="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform"
            :class="status === 'active' ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>
    </div>

    <template #footer>
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
        {{ submitting ? '保存中…' : '保存' }}
      </button>
    </template>
  </Modal>
</template>
