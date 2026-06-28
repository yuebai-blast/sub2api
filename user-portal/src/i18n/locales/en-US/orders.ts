export default {
  // Page header
  pageTitle: 'My Orders',
  pageSubtitle: 'View all your recharge and subscription orders.',
  backToRecharge: 'Back to Recharge',

  // Status filter tabs
  tabs: {
    all: 'All',
    pending: 'Pending',
    paid: 'Paid',
    completed: 'Completed',
    refunded: 'Refunded'
  },

  // Stat cards
  stats: {
    total: 'Total Orders',
    totalHint: '{paid} paid · {pending} pending',
    totalRecharge: 'Total Recharge',
    totalRechargeHint: 'Sum of completed orders',
    latest: 'Latest Order'
  },

  // Search
  searchPlaceholder: 'Search order no.…',
  searchHint: 'Search filters the current page only',

  // List
  empty: 'No order records yet',
  paySuccess: 'Payment successful, balance updated ✓',

  // Cancel confirmation modal
  cancelTitle: 'Cancel Order',
  cancelConfirmPrefix: 'Are you sure you want to cancel order',
  cancelConfirmSuffix: '? This action cannot be undone.',
  cancelReconsider: 'Never mind',
  cancelling: 'Cancelling…',
  confirmCancel: 'Confirm Cancel',
  cancelFailed: 'Failed to cancel order, please try again',

  // Detail modal
  detailTitle: 'Order Details',
  fields: {
    orderNo: 'Order No.',
    orderType: 'Order Type',
    amount: 'Recharge Amount',
    payAmount: 'Amount Paid',
    paymentMethod: 'Payment Method',
    status: 'Status',
    createdAt: 'Created at',
    expiresAt: 'Expires at',
    paidAt: 'Paid at',
    refundAmount: 'Refund Amount',
    refundReason: 'Refund Reason'
  },

  // Order types
  orderType: {
    balance: 'Account Recharge',
    subscription: 'Subscription'
  },

  // Order status badge labels (StatusBadge)
  status: {
    pending: 'Pending',
    paid: 'Paid',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded'
  },

  // Payment method display labels
  payment: {
    wechat: 'WeChat Pay',
    alipay: 'Alipay'
  },

  // Table headers
  table: {
    orderNo: 'Order No.',
    paid: 'Paid',
    paymentMethod: 'Payment Method',
    status: 'Status',
    createdAt: 'Created at',
    actions: 'Actions'
  },

  // Row actions
  actions: {
    view: 'View',
    payNow: 'Pay Now',
    reorder: 'Reorder'
  }
}
