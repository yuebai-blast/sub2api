import { describe, it, expect } from 'vitest'
import { orderStatusMeta } from '@/utils/format'

// 后端订单状态取值为 SCREAMING_SNAKE_CASE（见 backend payment.OrderStatus*），
// 前端必须以同样的取值理解状态：否则状态筛选 tab、状态徽章、行内按钮全部对不上。
describe('orderStatusMeta（识别后端大写枚举取值）', () => {
  it('PENDING → pending 变体且有可读文案（非回退原样输出）', () => {
    const meta = orderStatusMeta('PENDING')
    expect(meta.variant).toBe('pending')
    expect(meta.label).not.toBe('PENDING')
  })

  it('PAID / COMPLETED → paid 变体', () => {
    expect(orderStatusMeta('PAID').variant).toBe('paid')
    expect(orderStatusMeta('COMPLETED').variant).toBe('paid')
  })

  it('FAILED → neg，REFUNDED → muted', () => {
    expect(orderStatusMeta('FAILED').variant).toBe('neg')
    expect(orderStatusMeta('REFUNDED').variant).toBe('muted')
  })
})
