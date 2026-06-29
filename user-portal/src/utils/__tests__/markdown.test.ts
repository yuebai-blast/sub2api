import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '@/utils/markdown'

describe('renderMarkdown', () => {
  it('把标题渲染为 <h1>', () => {
    expect(renderMarkdown('# 你好')).toContain('<h1>')
  })

  it('自动把裸链接转为 <a>（linkify）', () => {
    expect(renderMarkdown('见 https://example.com')).toContain('<a')
  })
})
