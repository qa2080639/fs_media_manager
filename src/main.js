import Vue from 'vue'
import App from './App.vue'
import router from './router'
import util from './assets/js/util' // 全局方法

import './assets/css/reset.min.css'
import './assets/css/style.css'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(util);
Vue.use(ElementUI, {
  size: 'small'
});

Vue.config.productionTip = false

window.myVue = new Vue({
  router,
  render: h => h(App)
}).$mount('#app')