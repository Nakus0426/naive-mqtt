<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { type DropdownOption, type TreeDropInfo, NPerformantEllipsis, NText } from 'naive-ui'
import { Icon } from '@iconify/vue'
import {
	type RenderPrefix,
	type RenderLabel,
	type TreeOverrideNodeClickBehavior,
	type TreeNodeProps,
	type RenderSwitcherIcon,
} from 'naive-ui/lib/tree/src/interface'
import { type OnUpdateValueImpl as OnSelectSelect } from 'naive-ui/es/select/src/interface'
import { type OnUpdateValueImpl as OnDropdownSelect } from 'naive-ui/es/dropdown/src/interface'
import NewConnectionDialog from './new-connection-dialog.vue'
import NewGroupDialog from './new-group-dialog.vue'
import { useConnectionsStore } from '@/store/modules/connections'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionStore = useConnectionsStore()

const sideCollapsed = ref(false)

//#region 新建按钮
const newConnectionDialogRef = useTemplateRef('newConnectionDialog')
const newGroupDialogRef = useTemplateRef('newGroupDialog')
enum NewButtonDropdownOptionsKeyEnum {
	Connection = 'connection',
	Group = 'group',
}
const newButtonDropdownOptions: Array<DropdownOption> = [
	{
		label: () => t('connection.new_connection'),
		icon: () => <Icon height="16" width="16" icon="tabler:layers-linked" />,
		key: NewButtonDropdownOptionsKeyEnum.Connection,
	},
	{
		label: () => t('connection.new_group'),
		icon: () => <Icon height="16" width="16" icon="tabler:folder" />,
		key: NewButtonDropdownOptionsKeyEnum.Group,
	},
]

const handleNewButtonSelect: OnSelectSelect = key => {
	if (key === NewButtonDropdownOptionsKeyEnum.Connection) newConnectionDialogRef.value.open()
	else if (key === NewButtonDropdownOptionsKeyEnum.Group) newGroupDialogRef.value.open()
}
//#endregion

//#region 连接树渲染
const treePrefixRender: RenderPrefix = ({ option }) => {
	return (
		<Icon
			height="16"
			width="16"
			icon={option.isLeaf ? 'tabler:point-filled' : 'tabler:folder'}
			color={
				option.isLeaf
					? option.data?.['connected']
						? 'var(--success-color)'
						: 'var(--text-color-3)'
					: 'var(--primary-color)'
			}
		/>
	)
}
const treeLabelRender: RenderLabel = ({ option }) => (
	<NPerformantEllipsis tooltip={{ width: 'trigger' }}>{option.label}</NPerformantEllipsis>
)
const treeSwitcherIconRender: RenderSwitcherIcon = () => <Icon icon="tabler:chevron-right" />
const treeOverrideDefaultNodeClickBehavior: TreeOverrideNodeClickBehavior = ({ option }) => {
	return option.isLeaf ? 'default' : 'toggleExpand'
}
//#endregion

//#region 连接树右键菜单
const treeDropdownPosition = ref({ x: null, y: null })
const treeDropdownVisible = ref(false)
const treeDropdownOptions = ref<Array<DropdownOption>>()
enum TreeDropdownOptionsKeyEnum {
	Rename = 'rename',
	Delete = 'delete',
	Edit = 'edit',
	Duplicate = 'duplicate',
}

const treeNodeProps: TreeNodeProps = ({ option }) => {
	return {
		onContextmenu({ clientX, clientY }) {
			treeDropdownPosition.value = { x: clientX, y: clientY }
			treeDropdownVisible.value = true
			treeDropdownOptions.value = option.isLeaf
				? [
						{
							label: t('common.duplicate'),
							key: TreeDropdownOptionsKeyEnum.Duplicate,
							icon: () => <Icon height="16" width="16" icon="tabler:copy" />,
							clientId: option.key,
						},
						{
							label: t('common.edit'),
							key: TreeDropdownOptionsKeyEnum.Edit,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
							clientId: option.key,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKeyEnum.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
							clientId: option.key,
						},
					]
				: [
						{
							label: t('common.rename'),
							key: TreeDropdownOptionsKeyEnum.Rename,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
							groupId: option.key,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKeyEnum.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
							groupId: option.key,
						},
					]
		},
	}
}

const handleTreeDropdownSelect: OnDropdownSelect = (value, option) => {
	const isGroup = option.data['isGroup']
	if (value === TreeDropdownOptionsKeyEnum.Edit) newConnectionDialogRef.value.open(option.clientId as string)
	if (value === TreeDropdownOptionsKeyEnum.Rename) newGroupDialogRef.value.open(option.groupId as string)
	if (value === TreeDropdownOptionsKeyEnum.Duplicate) {
		const connection = structuredClone(
			toRaw(connectionStore.connections.find(item => item.clientId === option.clientId)),
		)
		connection.clientId = connectionStore.generateClientId()
		connection.name = `${connection.name} (Copy)`
		connectionStore.newConnection(connection)
	}
	if (value === TreeDropdownOptionsKeyEnum.Delete) {
		const title = t('common.delete')
		const content = () => (
			<div style="padding: 20px 26px">
				{t('common.delete_confirm', { name: t(`connection.${isGroup ? 'group' : 'connection'}`) })}
			</div>
		)
		window.$dialog.warning({
			title,
			content,
			positiveText: t('common.confirm'),
			negativeText: t('common.cancel'),
			onPositiveClick() {
				connectionStore.deleteConnection(option.clientId as string)
			},
		})
	}
	treeDropdownVisible.value = false
}
//#endregion

function handleTreeDrag({ node, dragNode, dropPosition }: TreeDropInfo) {}
</script>

<template>
	<div class="side" :collapse="sideCollapsed">
		<div class="header">
			<span>{{ t('main.menu.connection') }}</span>
			<NDropdown
				trigger="click"
				:options="newButtonDropdownOptions"
				size="small"
				placement="bottom-start"
				@select="handleNewButtonSelect"
			>
				<NButton size="tiny">
					<Icon icon="tabler:plus" />
				</NButton>
			</NDropdown>
		</div>
		<div class="body">
			<NTree
				:data="connectionStore.connectionTree"
				block-line
				expand-on-click
				key-field="clientId"
				label-field="name"
				:render-prefix="treePrefixRender"
				:render-label="treeLabelRender"
				:render-switcher-icon="treeSwitcherIconRender"
				:override-default-node-click-behavior="treeOverrideDefaultNodeClickBehavior"
				:node-props="treeNodeProps"
				virtual-scroll
				draggable
				@drop="handleTreeDrag"
			/>
		</div>
		<NDropdown
			:options="treeDropdownOptions"
			:show="treeDropdownVisible"
			:x="treeDropdownPosition.x"
			:y="treeDropdownPosition.y"
			placement="bottom-start"
			size="small"
			to=".main"
			@clickoutside="treeDropdownVisible = false"
			@select="handleTreeDropdownSelect"
		/>
		<button class="side_collapse" :collapse="sideCollapsed" @click="sideCollapsed = !sideCollapsed">
			<Icon height="18" width="18" icon="tabler:chevron-left" />
		</button>
		<NewConnectionDialog ref="newConnectionDialog" />
		<NewGroupDialog ref="newGroupDialog" />
	</div>
</template>

<style scoped lang="scss">
.side {
	position: relative;
	width: 300px;
	max-width: 300px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	border-right: 1px solid var(--border-color);
	transition: all 0.2s var(--cubic-bezier-ease-in-out);

	&[collapse='true'] {
		transform: translateX(-17px);
		max-width: 0;
	}

	&_collapse {
		position: absolute;
		right: 0px;
		top: 50%;
		height: 22px;
		width: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateX(50%);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		cursor: pointer;
		background-color: var(--card-color);
		padding: 0px;
		color: var(--text-color-2);
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
		z-index: 2;

		&[collapse='true'] {
			transform: translateX(200%);

			svg {
				transform: rotate(180deg);
			}
		}

		&:hover::before {
			background-color: var(--hover-color);
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			border-radius: 12px;
			z-index: 1;
			transition: all 0.2s var(--cubic-bezier-ease-in-out);
		}

		svg {
			z-index: 2;
			transition: all 0.2s;
		}
	}
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: var(--font-size-large);
	font-weight: bold;
	border-bottom: 1px solid transparent;
	transition: all 0.2s var(--cubic-bezier-ease-in-out);
	white-space: nowrap;
	overflow: hidden;
	padding: 8px 8px 0 8px;
}

.body {
	flex: 1;
	overflow: hidden;

	:deep(.n-tree) {
		padding: 0px 8px;

		&:has(.n-empty) {
			display: flex;
			flex: 1;
			align-items: center;
		}
	}

	:deep(.n-tree-node-switcher),
	:deep(.n-tree-node-content) {
		height: 40px;
		min-height: 40px;
	}

	:deep(.n-tree-node-content__text) {
		overflow: hidden;
	}
}
</style>
