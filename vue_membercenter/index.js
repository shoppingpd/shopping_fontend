import { createRouter, createWebHistory } from 'vue-router'
import ProfileView from '../views/ProfileView.vue'
import OrdersView from '../views/OrdersView.vue'

const routes = [
  { path: '/profile', component: ProfileView },
  { path: '/orders', component: OrdersView },
  { path: '/', redirect: '/profile' }
]

export default createRouter({
  history: createWebHistory(),
  routes
})