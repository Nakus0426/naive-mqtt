<script setup lang="tsx">
import { type Connection, useConnectionsStore } from '@/store/modules/connections'
import { type DropdownOption, type SelectGroupOption, NFlex, NText, NTooltip } from 'naive-ui'
import { type RenderOptionImpl as DropdownOptionRender } from 'naive-ui/es/dropdown/src/interface'
import { type RenderLabelImpl as PopselectLabelRender } from 'naive-ui/es/_internal/select-menu/src/interface'
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
const connectionsStore = useConnectionsStore()
const { connection, group, connected } = useContent()
const { newConnectionDialogEventHook, connectionDeleteConfirmEventHook, connectionSelectedUpdateEventHook } =
	useConnection()
const { t } = useI18n<{ message: MessageSchema }>()

//#region 连接切换下拉选择
const titlePopselectOptions = computed<Array<SelectGroupOption>>(() =>
	connectionsStore.connectionTree.map(node => ({
		value: node.clientId,
		label: node.name,
		data: node,
		type: node.isGroup ? 'group' : undefined,
		children: node.children.map(child => ({
			value: child.clientId,
			label: child.name,
			data: child,
		})),
	})),
)

const titlePopselectLabelRender: PopselectLabelRender = option => (
	<NFlex size={4} align="center">
		<Icon icon={option?.data['isGroup'] ? 'tabler:folder' : 'tabler:layers-linked'} />
		<span>{option.label}</span>
	</NFlex>
)
//#endregion

//#region 连接/断开
const connectLoading = ref(false)

async function handleConnectClick() {
	try {
		connectLoading.value = true
		if (connected.value) await connectionsStore.disconnect(clientId)
		else await connectionsStore.connect(clientId)
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
const dropdownOptionRender: DropdownOptionRender = ({ node, option }) => (
	<NTooltip content-style="white-space: nowrap;" placement="left" disabled={!option.disabled}>
		{{ trigger: () => node, default: () => t('connection.disconnect_first') }}
	</NTooltip>
)
const moreDropdownVisible = ref(false)

function handleMoreSelect(key: MoreDropdownOptionsKeyEnum) {
	if (key === MoreDropdownOptionsKeyEnum.Edit) newConnectionDialogEventHook.trigger({ type: 'edit', clientId })
	if (key === MoreDropdownOptionsKeyEnum.Delete) connectionDeleteConfirmEventHook.trigger(clientId)
}
//#endregion
</script>

<template>
	<div class="connection-content">
		<div class="header">
			<NPopselect
				:options="titlePopselectOptions"
				:render-label="titlePopselectLabelRender"
				:value="clientId"
				size="small"
				to=".main"
				trigger="click"
				virtual-scroll
				@update:value="value => connectionSelectedUpdateEventHook.trigger(value)"
			>
				<NButton quaternary icon-placement="right">
					<template #icon>
						<Icon icon="tabler:chevron-down" color="var(--text-color-3)" />
					</template>
					<div class="header_prefix">
						<template v-if="group">
							<span class="secondary">{{ group.name }}</span>
							<span class="secondary">/</span>
						</template>
						<span class="primary">{{ connection.name }}</span>
					</div>
				</NButton>
			</NPopselect>
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
					size="small"
					placement="bottom-end"
					to=".main"
					v-model:show="moreDropdownVisible"
					:options="moreDropdownOptions"
					:render-option="dropdownOptionRender"
					@select="handleMoreSelect"
				>
					<NTooltip placement="bottom" :disabled="moreDropdownVisible">
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
		<div class="body">
			<ContentSide />
			<ContentBody />
		</div>
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
	gap: 4px;
	overflow: hidden;
}

.header {
	height: 45px;
	min-height: 45px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8px;
	background-color: var(--card-color);
	border-radius: var(--border-radius);
	border: 1px solid var(--border-color);

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
	gap: 4px;
	overflow: hidden;
}
</style>
