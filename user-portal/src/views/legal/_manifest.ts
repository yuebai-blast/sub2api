import type { AppLocale } from '@/i18n'

/** 单个法律条款分节的元信息（侧栏顺序与中英标题的唯一数据源） */
export interface LegalSection {
  /** 锚点 slug，对应 content/<slug>.<locale>.md 文件名，也是页面 section 的 id */
  slug: string
  /** 各语言下的分节标题 */
  title: Record<AppLocale, string>
}

/** 条款分节清单：数组顺序即侧栏与正文顺序，首项为默认锚点 */
export const LEGAL_SECTIONS: LegalSection[] = [
  { slug: 'agreement', title: { 'zh-CN': '服务条款', 'en-US': 'User Agreement' } },
  { slug: 'privacy', title: { 'zh-CN': '隐私政策', 'en-US': 'Privacy Policy' } },
  { slug: 'refund', title: { 'zh-CN': '退款政策', 'en-US': 'Refund Policy' } },
  { slug: 'contact', title: { 'zh-CN': '联系我们', 'en-US': 'Contact Us' } }
]
