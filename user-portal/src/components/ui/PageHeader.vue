<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="mb-[30px] flex items-start justify-between">
    <div>
      <h1 class="mb-2 font-serif text-4xl font-medium tracking-tight text-text">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="text-sm text-subtle"
      >
        {{ subtitle }}
      </p>
    </div>
    <div class="flex items-center gap-2.5">
      <slot name="actions" />
    </div>
  </div>
</template>
