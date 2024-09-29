<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import { ConnectionRoute, ScriptRoute, SettingRoute } from '@/router/routes'
import { type RouteRecordRaw, type RouteRecordNameGeneric } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'

const { t } = useI18n<{ message: MessageSchema }>()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

const [DefineMenuItem, MenuItem] = createReusableTemplate<{
	icon: string
	label: string
	name?: RouteRecordNameGeneric
	onClick?: Function
}>()

const routes = [ConnectionRoute, ScriptRoute, SettingRoute]
const transitionName = ref('next-from-bottom')

function handleRouteChange(to: RouteRecordRaw) {
	const fromIndex = routes.findIndex(({ name }) => name === route.name)
	const nextIndex = routes.findIndex(({ name }) => name === to.name)
	transitionName.value = `next-from-${fromIndex > nextIndex ? 'bottom' : 'top'}`
	router.push(to)
}
</script>

<template>
	<DefineMenuItem v-slot="{ icon, label, name, onClick }">
		<NTooltip placement="right" :disabled="!appStore.isMenuCollapsed">
			<template #trigger>
				<NButton
					class="menu_item"
					:collapsed="appStore.isMenuCollapsed"
					:quaternary="route.name !== name"
					:tertiary="route.name === name"
					:type="route.name === name ? 'primary' : 'default'"
					@click="onClick(name)"
				>
					<template #icon>
						<Icon height="20" width="20" :icon />
					</template>
					{{ label }}
				</NButton>
			</template>
			{{ label }}
		</NTooltip>
	</DefineMenuItem>

	<NElement class="main">
		<div class="main_header">
			<img src="@/assets/images/logo.svg" />
			<span>Naive MQTT</span>
		</div>
		<div class="main_body">
			<div class="menu">
				<div class="menu_center">
					<MenuItem
						icon="tabler:layers-linked"
						:label="t('main.menu.connection')"
						:name="ConnectionRoute.name"
						@click="handleRouteChange(ConnectionRoute)"
					/>
					<MenuItem
						icon="tabler:code-asterisk"
						:label="t('main.menu.script')"
						:name="ScriptRoute.name"
						@click="handleRouteChange(ScriptRoute)"
					/>
				</div>
				<div class="menu_suffix">
					<MenuItem
						:icon="`tabler:layout-sidebar-${appStore.isMenuCollapsed ? 'right' : 'left'}-collapse`"
						:label="appStore.isMenuCollapsed ? t('main.menu.expand') : t('main.menu.collapse')"
						@click="appStore.isMenuCollapsed = !appStore.isMenuCollapsed"
					/>
					<MenuItem
						icon="tabler:settings"
						:label="t('main.menu.setting')"
						:name="SettingRoute.name"
						@click="handleRouteChange(SettingRoute)"
					/>
				</div>
			</div>
			<OverlayScrollbar class="content">
				<RouterView>
					<template #default="{ Component }">
						<Transition :name="transitionName">
							<KeepAlive>
								<component :is="Component" />
							</KeepAlive>
						</Transition>
					</template>
				</RouterView>
			</OverlayScrollbar>
		</div>
	</NElement>
</template>

<style scoped lang="scss">
.main {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	-webkit-app-region: drag;

	&_header {
		height: 30px;
		display: flex;
		gap: 8px;
		align-items: center;
		padding-left: 16px;
		font-size: var(--font-size-small);

		img {
			height: 16px;
			width: 16px;
		}
	}

	&_body {
		flex: 1;
		display: flex;
	}
}

.menu {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px;

	&_prefix {
		display: flex;
		justify-content: center;
	}

	&_center {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	&_suffix {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	&_item {
		height: 34px;
		width: 34px;
		justify-content: flex-start;
		padding: 0;
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
		overflow: hidden;
		-webkit-app-region: no-drag;

		&[collapsed='false'] {
			width: 100px;
		}
	}

	:deep(.n-button .n-button__icon) {
		width: 20px;
		height: 20px;
		margin: 0 9px 0px 7px;
		font-size: 20px;
	}
}

.content {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin: 0px 6px 6px 0px;
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius);
	background-color: var(--body-color);
	box-shadow: 1px 1px 3px 0px var(--divider-color);
	-webkit-app-region: no-drag;
}
</style>
