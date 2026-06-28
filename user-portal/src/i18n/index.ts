/**
 * vue-i18n 实例 —— Composition API 模式（legacy: false）。
 * - 支持简体中文（zh-CN）与英文（en-US）
 * - 首次访问无 localStorage 时跟随浏览器语言，回退中文
 * - locale 持久化键 `locale`，与 api/client.ts 的 Accept-Language 复用同一键
 * - 开启 globalInjection，模板内可直接用 $t；<script setup> 用 useI18n() 的 t
 */
import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

/** 各语言的展示名（用于切换菜单） */
export const LOCALE_LABELS: Record<AppLocale, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English'
}

export const DEFAULT_LOCALE: AppLocale = 'zh-CN'
const STORAGE_KEY = 'locale'

function isSupported(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/** 检测初始语言：localStorage > 浏览器语言（en* → en-US）> 回退中文 */
export function detectLocale(): AppLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && isSupported(saved)) return saved
    const nav = (navigator.language || '').toLowerCase()
    if (nav.startsWith('en')) return 'en-US'
    return DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
