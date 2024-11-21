<script setup lang="tsx">
import { type Connection } from '@/store/modules/connections'
import { type DropdownOption, NText } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { nanoid } from 'nanoid'
import { useProvideContent, useContent } from './use-content'
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import ContentSide from './content-side.vue'
import ContentBody from './content-body.vue'
import { useConnection } from './use-connection'

const { clientId } = defineProps<{ clientId?: Connection['clientId'] }>()

useProvideContent(clientId)
const { connection, group, connected } = useContent()
const { newConnectionDialogEventHook, connectionDeleteConfirmEventHook } = useConnection()
const { t } = useI18n<{ message: MessageSchema }>()

//#region 连接/断开
const connectLoading = ref(false)

async function handleConnectClick() {
	try {
		connectLoading.value = true
		if (connected.value) {
			const res = await window.electronAPI.mqttDisconnect(clientId)
			if (res.success) window.$message.success(t('connection.disconnect_success'))
		} else {
			const res = await window.electronAPI.mqttConnect(toRaw(connection.value))
			if (res.success) window.$message.success(t('connection.connect_success'))
		}
	} finally {
		connectLoading.value = false
	}
}
//#endregion

//#region 更多
enum MoreDropdownOptionsKeyEnum {
	Edit,
	Delete,
}
const moreDropdownOptions = computed<Array<DropdownOption>>(() => [
	{
		label: t('common.edit'),
		key: MoreDropdownOptionsKeyEnum.Edit,
		icon: () => <Icon width="16" height="16" icon="tabler:edit" />,
		disabled: connected.value,
	},
	{ key: nanoid(), type: 'divider' },
	{
		label: () => <NText type="error">{t('common.delete')}</NText>,
		key: MoreDropdownOptionsKeyEnum.Delete,
		icon: () => <Icon width="16" height="16" color="var(--error-color)" icon="tabler:trash" />,
		disabled: connected.value,
	},
])

function handleMoreSelect(key: MoreDropdownOptionsKeyEnum) {
	if (key === MoreDropdownOptionsKeyEnum.Edit) newConnectionDialogEventHook.trigger({ type: 'edit', clientId })
	if (key === MoreDropdownOptionsKeyEnum.Delete) connectionDeleteConfirmEventHook.trigger(clientId)
}
//#endregion
</script>

<template>
	<div class="connection-content">
		<div class="header">
			<div class="header_prefix">
				<template v-if="group">
					<span class="secondary">{{ group.name }}</span>
					<span class="secondary">/</span>
				</template>
				<span class="primary">{{ connection.name }}</span>
			</div>
			<div class="header_suffix">
				<NTooltip placement="bottom">
					<template #trigger>
						<NButton
							size="small"
							quaternary
							:type="connected ? 'error' : 'success'"
							:loading="connectLoading"
							@click="handleConnectClick()"
						>
							<template #icon>
								<Icon :icon="connected ? 'tabler:plug-connected-x' : 'tabler:plug-connected'" />
							</template>
						</NButton>
					</template>
					{{ t(`common.${connected ? 'disconnect' : 'connect'}`) }}
				</NTooltip>
				<NDropdown
					trigger="click"
					:options="moreDropdownOptions"
					size="small"
					placement="bottom-end"
					to=".main"
					@select="handleMoreSelect"
				>
					<NTooltip placement="bottom">
						<template #trigger>
							<NButton size="small" quaternary>
								<template #icon>
									<Icon icon="tabler:dots-vertical" />
								</template>
							</NButton>
						</template>
						{{ t('common.more') }}
					</NTooltip>
				</NDropdown>
			</div>
		</div>
		<OverlayScrollbar class="body">
			<ContentSide />
			<ContentBody />
		</OverlayScrollbar>
	</div>
</template>

<style scoped lang="scss">
.connection-content {
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.header {
	height: 45px;
	min-height: 45px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8px;
	border-bottom: 1px solid var(--border-color);

	&_prefix {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: var(--font-size-large);

		.primary {
			font-weight: bold;
		}

		.secondary {
			color: var(--text-color-3);
		}
	}

	&_suffix {
		display: flex;
		align-items: center;
		gap: 4px;
	}
}

.body {
	flex: 1;
	display: flex;
}
</style>
