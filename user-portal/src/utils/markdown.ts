// Markdown 渲染：markdown-it 单例（文档为自有可信内容，允许内嵌 HTML）
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

/** 把 Markdown 原文渲染为 HTML 字符串 */
export function renderMarkdown(src: string): string {
  return md.render(src)
}
