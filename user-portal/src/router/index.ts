import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { TOKEN_KEY } from '@/api/client'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, title: '仪表盘' }
  },
  {
    path: '/usage',
    name: 'Usage',
    component: () => import('@/views/UsageView.vue'),
    meta: { requiresAuth: true, title: '使用记录' }
  },
  {
    path: '/keys',
    name: 'Keys',
    component: () => import('@/views/KeysView.vue'),
    meta: { requiresAuth: true, title: 'API 密钥' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const authed = !!localStorage.getItem(TOKEN_KEY)
  if (to.meta.requiresAuth && !authed) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'Login' && authed) {
    return { name: 'Dashboard' }
  }
  return true
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'mint AI'
  document.title = `${title} · mint AI`
})

export default router
