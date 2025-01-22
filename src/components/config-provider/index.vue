<script setup lang="ts">
import { darkTheme, zhCN, dateZhCN, enUS, dateEnUS } from 'naive-ui'
import ProviderContent from './content.vue'
import { generateThemeOverrides } from '@/configs/theme'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from 'vue-i18n'

const { globalStyle = true } = defineProps<{ globalStyle?: boolean }>()

const appStore = useAppStore()

const theme = computed(() => (appStore.isDarkTheme ? darkTheme : null))
const themeOverrides = ref<any>(generateThemeOverrides(appStore.isDarkTheme, appStore.primaryColor))
watch([() => appStore.isDarkTheme, () => appStore.primaryColor], async () => {
	themeOverrides.value = null
	await nextTick()
	themeOverrides.value = generateThemeOverrides(appStore.isDarkTheme, appStore.primaryColor)
})

const { locale } = useI18n()
const localeMap = {
	'zh-CN': { locale: zhCN, dateLocale: dateZhCN },
	'en-US': { locale: enUS, dateLocale: dateEnUS },
}
</script>

<template>
	<NConfigProvider
		abstract
		:theme
		:theme-overrides
		:locale="localeMap[locale].locale"
		:date-locale="localeMap[locale].dateLocale"
	>
		<NGlobalStyle v-if="globalStyle" />
		<NLoadingBarProvider>
			<NMessageProvider placement="bottom">
				<NNotificationProvider>
					<NDialogProvider>
						<NModalProvider>
							<ProviderContent>
								<slot />
							</ProviderContent>
						</NModalProvider>
					</NDialogProvider>
				</NNotificationProvider>
			</NMessageProvider>
		</NLoadingBarProvider>
	</NConfigProvider>
</template>

<style scoped lang="scss"></style>
