export default {
  title: 'API 密钥',
  subtitle: '管理您的 API 密钥与访问令牌。',
  createKey: '创建密钥',
  creating: '创建中…',
  createFailed: '创建失败，请重试',
  searchPlaceholder: '搜索名称或 Key…',
  empty: '暂无密钥数据',
  status: {
    active: '活跃',
    inactive: '已禁用'
  },
  enable: '启用',
  disable: '禁用',
  stats: {
    totalLabel: '密钥总数',
    statusHint: '{active} 个已启用 · {inactive} 个已禁用',
    cost30dLabel: '近 30 天消费',
    costHint: '所有密钥合计'
  },
  filter: {
    allGroups: '全部分组',
    allStatus: '全部状态'
  },
  form: {
    name: '名称',
    namePlaceholder: '例如：生产环境',
    editNamePlaceholder: '密钥名称',
    group: '分组',
    noGroup: '不指定分组',
    expiryLabel: '有效期（天，留空表示永不过期）',
    expiryPlaceholder: '例如：30',
    quotaLabel: '配额（USD，留空表示不限）',
    quotaPlaceholder: '例如：10.00'
  },
  created: {
    title: '密钥已创建',
    warning: '请立即保存，关闭后不可再查看',
    keyLabel: '您的 API 密钥'
  },
  edit: {
    title: '编辑密钥',
    enableLabel: '启用密钥',
    saving: '保存中…'
  },
  delete: {
    confirmTitle: '确认删除',
    confirmPrefix: '确认删除密钥 ',
    confirmSuffix: '？此操作不可撤销。',
    confirmBtn: '确认删除',
    deleting: '删除中…'
  },
  table: {
    nameKey: '名称 · 密钥',
    group: '分组',
    status: '状态',
    usage: '用量',
    rate: '速率',
    actions: '操作',
    today: '今日',
    last30d: '30天',
    ratePerDay: '{n}/天',
    use: '使用'
  }
}
