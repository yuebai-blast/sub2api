<script setup lang="ts">
const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ 'update:page': [n: number] }>()
const from = () => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1)
const to = () => Math.min(props.page * props.pageSize, props.total)
const hasPrev = () => props.page > 1
const hasNext = () => props.page * props.pageSize < props.total
</script>

<template>
  <div class="flex items-center justify-between border-t border-track bg-hover px-[26px] py-4">
    <span class="text-[13px] text-subtle">{{ $t('ui.paginationSummary', { from: from(), to: to(), total, pageSize }) }}</span>
    <div class="flex items-center gap-1.5">
      <button
        class="rounded-lg border border-border px-[11px] py-1.5 text-[13px] text-faint disabled:opacity-50"
        :disabled="!hasPrev()"
        @click="emit('update:page', page - 1)"
      >
        ‹
      </button>
      <span class="rounded-lg bg-accent px-3 py-1.5 text-[13px] font-semibold text-white">{{ page }}</span>
      <button
        class="rounded-lg border border-border px-[11px] py-1.5 text-[13px] text-faint disabled:opacity-50"
        :disabled="!hasNext()"
        @click="emit('update:page', page + 1)"
      >
        ›
      </button>
    </div>
  </div>
</template>
