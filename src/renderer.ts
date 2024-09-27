import App from './app.vue'
import { createApp } from 'vue'
import { setupStore } from './store'
import { setupIconify } from './configs/iconify.ts'
import { setupNaiveUIDefaultConfig } from './configs/naive-ui.ts'
import '@/assets/css/index.scss'
import { setupRouter } from './router/index.ts'

const app = createApp(App)

setupStore(app)

setupIconify()

setupNaiveUIDefaultConfig()

setupRouter(app)

app.mount('#app')
