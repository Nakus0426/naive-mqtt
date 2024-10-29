import { type App } from 'vue'
import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN.json'
import enUS from '@/locales/en-US.json'
import { useAppStore } from '@/store/modules/app'

export type MessageSchema = typeof zhCN

export function setupI18n(app: App) {
	const i18n = createI18n<MessageSchema, 'zh-CN' | 'en-US'>({
		locale: useAppStore().locale,
		fallbackLocale: 'zh-CN',
		legacy: false,
		messages: {
			'zh-CN': zhCN,
			'en-US': enUS,
		},
	})
	app.use(i18n)
}
