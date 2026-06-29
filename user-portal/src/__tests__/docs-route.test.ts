import { describe, it, expect } from 'vitest'
import { routes } from '@/router'

describe('docs 路由', () => {
  it('注册了 Docs 命名路由，路径为 /docs/:slug?', () => {
    const docs = routes.find((r) => r.name === 'Docs')
    expect(docs).toBeTruthy()
    expect(docs?.path).toBe('/docs/:slug?')
    expect(docs?.meta?.requiresAuth).toBe(true)
    expect(docs?.meta?.title).toBe('nav.docs')
  })
})
