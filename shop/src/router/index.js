import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/MyHome.vue'),
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShoppingCart.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/MyTest.vue'),
    },
  ],
})

export default router
