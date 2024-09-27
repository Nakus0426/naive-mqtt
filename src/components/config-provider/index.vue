<script setup lang="ts">
import { darkTheme, zhCN, dateZhCN } from 'naive-ui'
import ProviderContent from './content.vue'
import { customDarkThemeOverrides } from '@/assets/theme/dark'
import { customLightThemeOverrides } from '@/assets/theme/light'
import { useAppStore } from '@/store/modules/app'

const { globalStyle = true } = defineProps<{ globalStyle?: boolean }>()

const appStore = useAppStore()

const theme = computed(() => (appStore.isDarkTheme ? darkTheme : null))
const themeOverrides = computed(() => (appStore.isDarkTheme ? customDarkThemeOverrides : customLightThemeOverrides))
</script>

<template>
	<NConfigProvider
		abstract
		inline-theme-disabled
		:theme
		:theme-overrides="themeOverrides"
		:locale="zhCN"
		:date-locale="dateZhCN"
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
