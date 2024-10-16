<script setup lang="ts">
import { darkTheme, zhCN, dateZhCN, enUS, dateEnUS } from 'naive-ui'
import ProviderContent from './content.vue'
import { customDarkThemeOverrides } from '@/assets/theme/dark'
import { customLightThemeOverrides } from '@/assets/theme/light'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from 'vue-i18n'

const { globalStyle = true } = defineProps<{ globalStyle?: boolean }>()

const appStore = useAppStore()

const theme = computed(() => (appStore.isDarkTheme ? darkTheme : null))
const themeOverrides = computed(() => (appStore.isDarkTheme ? customDarkThemeOverrides : customLightThemeOverrides))

const { locale } = useI18n()
const localeMap = {
	'zh-CN': { locale: zhCN, dateLocale: dateZhCN },
	'en-US': { locale: enUS, dateLocale: dateEnUS },
}
</script>

<template>
	<NConfigProvider
		abstract
		inline-theme-disabled
		:theme
		:theme-overrides="themeOverrides"
		:locale="localeMap[locale].locale"
		:date-locale="localeMap[locale].dateLocale"
	>
		<NGlobalStyle v-if="globalStyle" />
		<NLoadingBarProvider>
			<NMessageProvider>
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
