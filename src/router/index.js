import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Indexes from '../views/Indexes.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  name: '文件管理',
  component: Home
}, {
  path: '/indexes',
  name: '索引管理',
  component: Indexes
}]

const router = new VueRouter({
  routes
})

export default router