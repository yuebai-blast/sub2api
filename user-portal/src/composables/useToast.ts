import { ref } from 'vue'

/** 提示类型：成功 / 失败（沿用主题 pos / neg 语义色） */
export type ToastType = 'SUCCESS' | 'ERROR'

/** 单条提示 */
export interface Toast {
  id: number
  type: ToastType
  message: string
}

// 模块级单例：全局共享一个提示队列，任意组件 push、ToastHost 统一渲染
const toasts = ref<Toast[]>([])
let seq = 0

/** 默认停留时长（毫秒） */
const DEFAULT_DURATION = 3000

/** 移除指定提示 */
function dismiss(id: number) {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

/** 弹出一条提示，到时自动消失 */
function push(type: ToastType, message: string, duration = DEFAULT_DURATION) {
  const id = ++seq
  toasts.value.push({ id, type, message })
  window.setTimeout(() => dismiss(id), duration)
}

/**
 * 全局提示。任意组件调用 `const toast = useToast()` 后：
 * - `toast.success(msg)` 弹成功提示
 * - `toast.error(msg)` 弹失败提示
 */
export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message: string) => push('SUCCESS', message),
    error: (message: string) => push('ERROR', message)
  }
}
