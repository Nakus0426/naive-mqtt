import { createRouter, createWebHashHistory } from 'vue-router'
import { App } from 'vue'
import { RootRoute } from '@/router/routes'

/** 创建router */
export const router = createRouter({
	history: createWebHashHistory(),
	routes: [RootRoute],
	strict: true,
})

/** 配置router */
export function setupRouter(app: App<Element>) {
	app.use(router)
}
