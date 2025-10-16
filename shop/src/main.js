import './assets/main.css'
import { createPinia } from 'pinia'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.config.devtools = false;
app.use(router)
app.use(createPinia())
app.mount('#app')
