import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
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
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },

      //我的賣場 layout + 子頁面
    {
      path: '/myshop',
      component: () => import('../views/MyShop.vue'),
      children: [
        {
          path: 'myproduct',
          name: 'myproduct',
          component: () => import('../views/MyProduct.vue'),
        },
        {
          path: 'addproduct',
          name: 'addproduct',
          component: () => import('../views/MyProductAdd.vue'),
        },
        {
          path: 'ordermanagement',
          name: 'ordermanagement',
          component: () => import('../views/OrderManagement.vue'),
        },
      ],
    },

    //會員中心 layout + 子頁面
    {
      path: '/membercenter',
      component: () => import('../views/MemberCenter.vue'),
      children: [
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../views/OrderView.vue'),
        },
      ],
    },

  ],
})

export default router
