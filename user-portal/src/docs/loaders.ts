import type { AppLocale } from '@/i18n'

// 文档内容在模块加载时预读（eager）：用户门户文档量小，预加载不成负担；
// 且 eager glob 返回的是已解析字符串，loadDoc 可用 Promise.resolve() 同步返回，
// 在测试环境（vitest + flushPromises）中能正确触发微任务队列，避免 flushPromises
// 因动态 import() 的 I/O 异步比 setImmediate 晚完成而拿不到渲染结果。
const loaders = import.meta.glob('./*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

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
  if (primary != null) return Promise.resolve(primary)
  const fallback = loaders[docKey(slug, 'zh-CN')]
  if (fallback != null) return Promise.resolve(fallback)
  return Promise.reject(new Error(`文档不存在：${slug}`))
}
