<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import PortalLayout from '@/layouts/PortalLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import AccountHero from '@/components/profile/AccountHero.vue'
import ProfileForm from '@/components/profile/ProfileForm.vue'
import BindingList from '@/components/profile/BindingList.vue'
import { useProfile } from '@/composables/useProfile'
import { useSettingsStore } from '@/stores/settings'

const p = useProfile()
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

onMounted(() => {
  p.load()
  settingsStore.ensureLoaded()
})
</script>

<template>
  <PortalLayout>
    <PageHeader
      title="个人资料"
      subtitle="管理您的账户信息与登录方式。"
    />

    <!-- 加载态 -->
    <div
      v-if="p.loading.value && !p.user.value"
      class="flex items-center justify-center py-24"
    >
      <LoadingSpinner :size="32" />
    </div>

    <!-- 错误态 -->
    <div
      v-else-if="p.error.value && !p.user.value"
      class="rounded-xl3 border border-dashed border-border2 bg-card px-7 py-16 text-center text-sm text-subtle"
    >
      {{ p.error.value }}
      <button
        class="ml-2 underline"
        @click="p.load()"
      >
        重试
      </button>
    </div>

    <!-- 内容 -->
    <template v-else-if="p.user.value">
      <AccountHero :user="p.user.value" />

      <ProfileForm
        :user="p.user.value"
        @save-username="p.saveUsername"
        @upload="p.saveAvatar"
        @remove-avatar="p.removeAvatar"
      />

      <BindingList
        :user="p.user.value"
        :settings="settings"
        @bind="p.bind"
        @unbind="p.unbind"
      />
    </template>
  </PortalLayout>
</template>
