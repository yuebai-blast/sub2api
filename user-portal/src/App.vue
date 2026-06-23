<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

// 实例化即应用主题（store 内部已在创建时 apply 到 <html>）
useThemeStore()
</script>

<template>
  <router-view />
</template>
