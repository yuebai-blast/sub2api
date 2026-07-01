import { vi } from 'vitest'

// mock legal loaders：按 slug 立即 resolve 一段可辨识的 markdown，保留真实 renderMarkdown，
// 只隔离 md 文件的 I/O 异步；无需真实 fetch 8 个 md。
vi.mock('@/views/legal/loaders', () => ({
  loadLegal: vi.fn((slug: string) => Promise.resolve(`### ${slug} body\n\nsome clause text`)),
  legalKey: vi.fn((slug: string, locale: string) => `./content/${slug}.${locale}.md`)
}))

import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import LegalView from '@/views/LegalView.vue'
import { LEGAL_SECTIONS } from '@/views/legal/_manifest'

// jsdom 无 IntersectionObserver（组件挂载时用于滚动高亮），stub 成空实现
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    }
  )
  setActivePinia(createPinia())
})

function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/legal', name: 'Legal', component: LegalView },
      { path: '/register', component: { template: '<div/>' } }
    ]
  })
}

// legal 文案齐全，避免 $t 输出键名影响断言
const messages = {
  'zh-CN': { legal: { title: '法律条款', heading: '条款与政策', intro: '请阅读', back: '返回', translationNotice: '以英文版为准' } },
  'en-US': { legal: { title: 'Legal', heading: 'Terms & Policies', intro: 'Read', back: 'Back', translationNotice: '' } }
}
const i18n = createI18n({ legacy: false, locale: 'zh-CN', messages })

describe('LegalView', () => {
  it('渲染四段侧栏标题与正文 HTML', async () => {
    const router = makeRouter()
    router.push('/legal')
    await router.isReady()
    const wrapper = mount(LegalView, { global: { plugins: [router, i18n] } })
    await flushPromises()

    // 侧栏 + 正文含每个分节的中文标题（localeStore 默认 zh-CN）
    for (const s of LEGAL_SECTIONS) {
      expect(wrapper.text()).toContain(s.title['zh-CN'])
    }
    // 每段 section 带对应 id 锚点
    for (const s of LEGAL_SECTIONS) {
      expect(wrapper.find(`section#${s.slug}`).exists()).toBe(true)
    }
    // 正文渲染出 markdown 的 h3
    expect(wrapper.html()).toContain('<h3>')
  })
})
