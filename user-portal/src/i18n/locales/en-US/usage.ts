export default {
  title: 'Usage logs',
  subtitle: 'View and analyze your API usage history.',
  exportCsv: 'Export CSV',
  stats: {
    totalRequests: 'Total requests',
    inRange: 'In selected range',
    totalTokens: 'Total tokens',
    totalCost: 'Total cost',
    costHint: 'Actual / Standard ${cost}',
    avgDuration: 'Avg. duration',
    perRequest: 'Per request',
  },
  kpi: {
    tokenHint: 'In {input} · Out {output} · Cache hit {cache}\nHit rate {rate}%',
  },
  // Billing type display labels
  billingType: {
    subscription: 'Subscription',
    payg: 'Pay-as-you-go',
  },
  filters: {
    apiKey: 'API key',
    allKeys: 'All keys',
    startDate: 'Start date',
    endDate: 'End date',
  },
  table: {
    key: 'Key',
    model: 'Model',
    effort: 'Effort',
    endpoint: 'Endpoint',
    type: 'Type',
    billing: 'Billing',
    token: 'Tokens',
    cost: 'Cost',
    firstToken: 'First token',
    duration: 'Duration',
    timeUa: 'Time · UA',
    stream: 'Stream',
    sync: 'Sync',
  },
  empty: 'No usage logs yet.',
}
