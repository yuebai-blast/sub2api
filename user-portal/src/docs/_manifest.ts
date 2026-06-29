import type { AppLocale } from '@/i18n'

/** 单篇文档的导航元信息（导航顺序与中英标题的唯一数据源） */
export interface DocEntry {
  /** 路由 slug，对应 docs/<slug>.<locale>.md 文件名 */
  slug: string
  /** 各语言下的目录标题 */
  title: Record<AppLocale, string>
}

/** 文档清单：数组顺序即目录顺序，首项为默认篇 */
export const DOCS: DocEntry[] = [
  { slug: 'quick-start', title: { 'zh-CN': '快速开始', 'en-US': 'Quick Start' } }
]
