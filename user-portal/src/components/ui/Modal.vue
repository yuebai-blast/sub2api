<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
const props = defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits<{ close: [] }>()
function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && props.open) emit('close') }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div
      class="absolute inset-0 bg-black/40"
      @click="emit('close')"
    />
    <div class="relative z-10 w-full max-w-[460px] rounded-xl4 bg-card p-7 shadow-menu">
      <h3
        v-if="title"
        class="mb-5 font-serif text-xl font-medium text-text"
      >
        {{ title }}
      </h3>
      <slot />
      <div class="mt-6 flex justify-end gap-3">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
