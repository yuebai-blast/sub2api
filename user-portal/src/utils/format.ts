// 数值/金额/Token/时长格式化（与主前端展示口径一致）

const usd2 = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

/** 余额/金额，保留 2 位 */
export function formatBalance(n: number): string {
  return usd2.format(Number.isFinite(n) ? n : 0)
}

/** 消费金额，保留 4 位（与后端计费精度一致） */
export function formatCost(n: number): string {
  return (Number.isFinite(n) ? n : 0).toFixed(4)
}

/** 千分位整数 */
export function formatNumber(n: number): string {
  return (n ?? 0).toLocaleString()
}

/** Token 数缩写：K / M */
export function formatTokens(n: number): string {
  const v = n ?? 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return String(v)
}

/** 时长：ms / s */
export function formatDuration(ms: number): string {
  const v = ms ?? 0
  return v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${v.toFixed(0)}ms`
}

/** 百分比（0-100 整数） */
export function percent(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)))
}

/** 本地日期字符串 YYYY-MM-DD */
export function toLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
