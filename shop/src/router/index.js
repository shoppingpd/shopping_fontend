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
    {
      path: '/productpage',
      name: 'productpage',
      component: () => import('../views/ProductPage.vue'),
    },
    {
      path: '/shoplist',
      name: 'shoplist',
      component: () => import('../views/ShopList.vue'),
    },

    {
      path: '/member',
      component: () => import('../views/MemberCenter.vue'),
      children: [
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue')
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../views/OrdersView.vue')
        }
      ]
    }

  ],
})

export default router
