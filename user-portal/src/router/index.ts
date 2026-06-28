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
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false, title: '注册' }
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
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/RechargeView.vue'),
    meta: { requiresAuth: true, title: '充值' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true, title: '我的订单' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, title: '个人资料' }
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
  if ((to.name === 'Login' || to.name === 'Register') && authed) {
    return { name: 'Dashboard' }
  }
  return true
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || 'MintPop API'
  document.title = `${title} · MintPop API`
})

export default router
