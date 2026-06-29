import type { AppLocale } from '@/i18n'

// 懒加载：每篇 md 编译为独立 chunk，按需 fetch；?raw 取原文字符串。
// glob 收口在 docs/ 自身，key 形如 './quick-start.zh-CN.md'，稳定且测试可复用。
const loaders = import.meta.glob('./*.md', {
  query: '?raw',
  import: 'default'
}) as Record<string, () => Promise<string>>

/** 由 slug + 语言拼出 glob key */
export function docKey(slug: string, locale: AppLocale): string {
  return `./${slug}.${locale}.md`
}

/** 该 slug 的指定语言文档是否存在 */
export function hasDoc(slug: string, locale: AppLocale): boolean {
  return docKey(slug, locale) in loaders
}

/**
 * 加载某篇文档原文。命中当前语言即返回；缺当前语言回退 zh-CN；
 * 两者都缺则抛错（调用方决定如何兜底展示）。
 */
export function loadDoc(slug: string, locale: AppLocale): Promise<string> {
  const primary = loaders[docKey(slug, locale)]
  if (primary) return primary()
  const fallback = loaders[docKey(slug, 'zh-CN')]
  if (fallback) return fallback()
  return Promise.reject(new Error(`文档不存在：${slug}`))
}
