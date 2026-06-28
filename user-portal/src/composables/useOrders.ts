import { ref } from 'vue'
import i18n from '@/i18n'
import { getMyOrders, cancelOrder } from '@/api/payment'
import type { PaymentOrder } from '@/api/types'

export function useOrders() {
  const rows = ref<PaymentOrder[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const statusFilter = ref('')
  const search = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await getMyOrders({
        page: page.value,
        page_size: pageSize.value,
        status: statusFilter.value || undefined
      })
      rows.value = res.items
      total.value = res.total
      loaded.value = true
    } catch (e) {
      error.value = (e as { message?: string }).message || i18n.global.t('common.loadFailed')
    } finally {
      loading.value = false
    }
  }

  function setPage(n: number) {
    page.value = n
    load()
  }

  async function cancel(id: number) {
    await cancelOrder(id)
    await load()
  }

  return { rows, total, page, pageSize, statusFilter, search, loading, error, loaded, load, setPage, cancel }
}
