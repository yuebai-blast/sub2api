export default {
  title: '使用记录',
  subtitle: '查看和分析您的 API 使用历史。',
  exportCsv: '导出 CSV',
  stats: {
    totalRequests: '总请求数',
    inRange: '所选范围内',
    totalTokens: '总 Token',
    totalCost: '总消费',
    costHint: '实际 / 标准 ${cost}',
    avgDuration: '平均耗时',
    perRequest: '每次请求',
  },
  kpi: {
    tokenHint: '入 {input} · 出 {output} · 缓存命中 {cache}\n命中率 {rate}%',
  },
  // 计费类型展示文案
  billingType: {
    subscription: '订阅',
    payg: '按量',
  },
  filters: {
    apiKey: 'API 密钥',
    allKeys: '全部密钥',
    startDate: '开始日期',
    endDate: '结束日期',
  },
  table: {
    key: '密钥',
    model: '模型',
    effort: '强度',
    endpoint: '端点',
    type: '类型',
    billing: '计费',
    token: 'Token',
    cost: '费用',
    firstToken: '首 Token',
    duration: '耗时',
    timeUa: '时间 · UA',
    stream: '流式',
    sync: '同步',
  },
  empty: '暂无使用记录',
}
