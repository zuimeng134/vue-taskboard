import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard' // 默认重定向到仪表盘
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('../views/TaskView.vue')
    }
  ]
})

// 简单路由守卫：检查是否登录
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  // 如果要去非登录页，且没有token，就跳转到登录页
  if (to.name !== 'login' && !token) {
    return { name: 'login' }
  }
})

export default router