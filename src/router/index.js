import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/views/OrdersView.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'dishes',
        name: 'dishes',
        component: () => import('@/views/DishesView.vue'),
        meta: { title: '菜品管理' }
      },
      {
        path: 'tables',
        name: 'tables',
        component: () => import('@/views/TablesView.vue'),
        meta: { title: '桌台管理' }
      },
      {
        path: 'reservations',
        name: 'reservations',
        component: () => import('@/views/ReservationsView.vue'),
        meta: { title: '预约管理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(to => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && auth.token) {
    return '/dashboard'
  }
  return true
})

export default router
