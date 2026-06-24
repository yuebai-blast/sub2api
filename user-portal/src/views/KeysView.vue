<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import PortalLayout from '@/layouts/PortalLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import Pagination from '@/components/ui/Pagination.vue'
import Modal from '@/components/ui/Modal.vue'
import KeyTable from '@/components/keys/KeyTable.vue'
import CreateKeyModal from '@/components/keys/CreateKeyModal.vue'
import EditKeyModal from '@/components/keys/EditKeyModal.vue'
import { useKeys } from '@/composables/useKeys'
import { formatCost } from '@/utils/format'
import type { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '@/api/types'

const k = useKeys()
const showCreate = ref(false)
const editTarget = ref<ApiKey | null>(null)
const removeTarget = ref<ApiKey | null>(null)
const removing = ref(false)

onMounted(() => {
  k.load()
  k.loadGroups()
})

// 统计卡片：从当前页计算（精简版，不分页汇总）
const activeCount = computed(() => k.rows.value.filter((r) => r.status === 'active').length)
const inactiveCount = computed(() => k.rows.value.filter((r) => r.status !== 'active').length)

const totalCost = computed(() => {
  return Object.values(k.usage.value).reduce((sum, s) => sum + (s.total_actual_cost ?? 0), 0)
})

function onCopy(key: ApiKey) {
  navigator.clipboard?.writeText(key.key).catch(() => {})
}

async function doCreate(payload: CreateApiKeyRequest, done: (nk: ApiKey) => void) {
  try {
    const nk = await k.create(payload)
    done(nk)
  } catch {
    // 创建失败时也回调，让弹窗恢复可提交状态
    done(null as unknown as ApiKey)
  }
}

async function doEdit(id: number, patch: UpdateApiKeyRequest) {
  await k.update(id, patch)
  editTarget.value = null
}

async function confirmRemove() {
  if (!removeTarget.value || removing.value) return
  removing.value = true
  try {
    await k.remove(removeTarget.value.id)
    removeTarget.value = null
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <PortalLayout>
    <!-- 页头 -->
    <PageHeader
      title="API 密钥"
      subtitle="管理您的 API 密钥与访问令牌。"
    >
      <template #actions>
        <button
          class="rounded-full bg-card px-4 py-[11px] text-[13px] font-medium text-text2 shadow-pill transition-colors hover:text-text"
          :disabled="k.loading.value"
          @click="k.load()"
        >
          ↻ 刷新
        </button>
        <button
          class="rounded-full bg-accent px-[22px] py-[11px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(20,194,138,.3)] transition-opacity hover:opacity-90"
          @click="showCreate = true"
        >
          + 创建密钥
        </button>
      </template>
    </PageHeader>

    <!-- 加载态 -->
    <LoadingSpinner
      v-if="k.loading.value && !k.loaded.value"
      :size="32"
    />

    <!-- 错误态 -->
    <div
      v-else-if="k.error.value && !k.loaded.value"
      class="rounded-xl3 border border-dashed border-border2 bg-card px-7 py-16 text-center text-sm text-subtle"
    >
      {{ k.error.value }}
      <button
        class="ml-2 underline"
        @click="k.load()"
      >
        重试
      </button>
    </div>

    <!-- 内容 -->
    <template v-else>
      <!-- 统计卡片 -->
      <div class="mb-[22px] grid grid-cols-2 gap-[18px]">
        <StatCard
          label="密钥总数"
          :value="String(k.total.value)"
          :hint="`${activeCount} 个已启用 · ${inactiveCount} 个已禁用`"
          accent
        />
        <StatCard
          label="近 30 天消费"
          :value="`$${formatCost(totalCost)}`"
          hint="所有密钥合计"
          accent
        />
      </div>

      <!-- 筛选栏 -->
      <FilterBar>
        <!-- 搜索 -->
        <div class="relative max-w-[340px] flex-1">
          <svg
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />
            <path d="M21 21l-4-4" />
          </svg>
          <input
            v-model="k.filters.search"
            type="text"
            placeholder="搜索名称或 Key…"
            class="w-full rounded-[11px] border-[1.5px] border-border2 bg-card py-[11px] pl-10 pr-4 text-sm text-text outline-none focus:border-accent"
            @change="k.load()"
          >
        </div>

        <!-- 分组筛选 -->
        <select
          v-model="k.filters.group_id"
          class="rounded-[11px] border-[1.5px] border-border2 bg-card px-4 py-[11px] text-[13px] font-medium text-text2 outline-none focus:border-accent"
          @change="k.load()"
        >
          <option value="">
            全部分组
          </option>
          <option
            v-for="g in k.groups.value"
            :key="g.id"
            :value="String(g.id)"
          >
            {{ g.name }}
          </option>
        </select>

        <!-- 状态筛选 -->
        <select
          v-model="k.filters.status"
          class="rounded-[11px] border-[1.5px] border-border2 bg-card px-4 py-[11px] text-[13px] font-medium text-text2 outline-none focus:border-accent"
          @change="k.load()"
        >
          <option value="">
            全部状态
          </option>
          <option value="active">
            活跃
          </option>
          <option value="inactive">
            已禁用
          </option>
        </select>
      </FilterBar>

      <!-- 表格 -->
      <KeyTable
        :rows="k.rows.value"
        :usage="k.usage.value"
        @edit="editTarget = $event"
        @toggle="k.toggle($event.id, $event.status === 'active' ? 'inactive' : 'active')"
        @remove="removeTarget = $event"
        @copy="onCopy($event)"
      />

      <!-- 分页 -->
      <Pagination
        :page="k.page.value"
        :page-size="k.pageSize.value"
        :total="k.total.value"
        @update:page="k.setPage($event)"
      />
    </template>

    <!-- 创建弹窗 -->
    <CreateKeyModal
      :open="showCreate"
      :groups="k.groups.value"
      @close="showCreate = false"
      @submit="doCreate"
    />

    <!-- 编辑弹窗 -->
    <EditKeyModal
      :open="!!editTarget"
      :target="editTarget"
      :groups="k.groups.value"
      @close="editTarget = null"
      @submit="doEdit"
    />

    <!-- 删除确认弹窗 -->
    <Modal
      :open="!!removeTarget"
      title="确认删除"
      @close="removeTarget = null"
    >
      <p class="text-sm text-text2">
        确认删除密钥 <b class="font-semibold text-text">{{ removeTarget?.name }}</b>？此操作不可撤销。
      </p>
      <template #footer>
        <button
          class="rounded-full border border-border px-5 py-2 text-sm font-medium text-text2 transition-colors hover:border-border2 hover:text-text"
          @click="removeTarget = null"
        >
          取消
        </button>
        <button
          class="rounded-full bg-neg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          :disabled="removing"
          @click="confirmRemove"
        >
          {{ removing ? '删除中…' : '确认删除' }}
        </button>
      </template>
    </Modal>
  </PortalLayout>
</template>
