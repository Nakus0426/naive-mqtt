import App from './app.vue'
import { createApp } from 'vue'
import { setupStore } from './store'
import { setupIconify } from './configs/iconify'
import { setupNaiveUIDefaultConfig } from './configs/naive-ui'
import '@/assets/css/index.scss'
import { setupRouter } from './router/index'
import { setupI18n } from './configs/i18n'
import { createClient } from 'electron-bridge-ipc/electron-sandbox'

await createClient()

const app = createApp(App)

setupStore(app)

setupIconify()

setupNaiveUIDefaultConfig()

setupRouter(app)

setupI18n(app)

app.mount('#app')
