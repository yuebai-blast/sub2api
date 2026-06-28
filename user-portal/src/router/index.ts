import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { TOKEN_KEY } from '@/api/client'
import i18n from '@/i18n'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: 'nav.login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false, title: 'nav.register' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'nav.dashboard' }
  },
  {
    path: '/usage',
    name: 'Usage',
    component: () => import('@/views/UsageView.vue'),
    meta: { requiresAuth: true, title: 'nav.usage' }
  },
  {
    path: '/keys',
    name: 'Keys',
    component: () => import('@/views/KeysView.vue'),
    meta: { requiresAuth: true, title: 'nav.keys' }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('@/views/PricingView.vue'),
    meta: { requiresAuth: true, title: 'nav.pricing' }
  },
  {
    path: '/recharge',
    name: 'Recharge',
    component: () => import('@/views/RechargeView.vue'),
    meta: { requiresAuth: true, title: 'nav.recharge' }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/OrdersView.vue'),
    meta: { requiresAuth: true, title: 'nav.orders' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'nav.profile' }
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
  const key = to.meta.title as string | undefined
  const title = key ? i18n.global.t(key) : 'MintPop API'
  document.title = `${title} · MintPop API`
})

export default router
