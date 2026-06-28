export default {
  title: 'API Keys',
  subtitle: 'Manage your API keys and access tokens.',
  createKey: 'Create Key',
  creating: 'Creating…',
  createFailed: 'Failed to create, please try again',
  searchPlaceholder: 'Search by name or key…',
  empty: 'No API keys yet',
  status: {
    active: 'Active',
    inactive: 'Disabled'
  },
  enable: 'Enable',
  disable: 'Disable',
  stats: {
    totalLabel: 'Total Keys',
    statusHint: '{active} active · {inactive} disabled',
    cost30dLabel: 'Spend (Last 30 Days)',
    costHint: 'All keys combined'
  },
  filter: {
    allGroups: 'All Groups',
    allStatus: 'All Statuses'
  },
  form: {
    name: 'Name',
    namePlaceholder: 'e.g. Production',
    editNamePlaceholder: 'Key name',
    group: 'Group',
    noGroup: 'No group',
    expiryLabel: 'Expiry (days, leave empty for never)',
    expiryPlaceholder: 'e.g. 30',
    quotaLabel: 'Quota (USD, leave empty for unlimited)',
    quotaPlaceholder: 'e.g. 10.00'
  },
  created: {
    title: 'Key Created',
    warning: 'Save it now — it cannot be viewed again after closing',
    keyLabel: 'Your API Key'
  },
  edit: {
    title: 'Edit Key',
    enableLabel: 'Enable key',
    saving: 'Saving…'
  },
  delete: {
    confirmTitle: 'Confirm Deletion',
    confirmPrefix: 'Delete API key ',
    confirmSuffix: '? This action cannot be undone.',
    confirmBtn: 'Confirm Delete',
    deleting: 'Deleting…'
  },
  table: {
    nameKey: 'Name · Key',
    group: 'Group',
    status: 'Status',
    usage: 'Usage',
    rate: 'Rate',
    actions: 'Actions',
    today: 'Today',
    last30d: '30d',
    ratePerDay: '{n}/day',
    use: 'Use'
  }
}
