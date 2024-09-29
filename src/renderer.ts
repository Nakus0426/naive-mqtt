import App from './app.vue'
import { createApp } from 'vue'
import { setupStore } from './store'
import { setupIconify } from './configs/iconify.ts'
import { setupNaiveUIDefaultConfig } from './configs/naive-ui.ts'
import '@/assets/css/index.scss'
import { setupRouter } from './router/index.ts'
import { setupI18n } from './configs/i18n.ts'

const app = createApp(App)

setupStore(app)

setupIconify()

setupNaiveUIDefaultConfig()

setupRouter(app)

setupI18n(app)

app.mount('#app')
