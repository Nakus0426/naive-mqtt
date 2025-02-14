<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { type DropdownOption, type TreeDropInfo, type TreeOption, NPerformantEllipsis, NText, NTooltip } from 'naive-ui'
import { Icon } from '@iconify/vue'
import {
	type RenderLabel,
	type TreeOverrideNodeClickBehavior,
	type TreeNodeProps,
	type RenderSwitcherIcon,
} from 'naive-ui/lib/tree/src/interface'
import { type OnUpdateValueImpl as OnSelectSelect } from 'naive-ui/es/select/src/interface'
import {
	type OnUpdateValueImpl as OnDropdownSelect,
	type RenderOptionImpl as DropdownOptionRender,
} from 'naive-ui/es/dropdown/src/interface'
import { type FormValidationStatus } from 'naive-ui/es/form/src/interface'
import { type Connection, EditTypeEnum, useConnectionsStore } from '@/store/modules/connections'
import { nanoid } from 'nanoid'
import { isNotNil } from 'es-toolkit'
import { useConnection } from './use-connection'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionsStore = useConnectionsStore()
const {
	selectedClientId,
	newConnectionDialogEventHook,
	connectionDeleteConfirmEventHook,
	connectionSelectedUpdateEventHook,
} = useConnection()

//#region 宽度
const sideWidth = computed(() => `${connectionsStore.sideWidth}px`)
const sideResizing = ref(false)

function handleSideDrag({ clientX }: MouseEvent) {
	sideResizing.value = true
	const startX = clientX
	const initialWidth = connectionsStore.sideWidth
	const onMouseMove = ({ clientX: _clientX }: MouseEvent) => {
		if (!sideResizing.value) return

		const diffX = _clientX - startX
		connectionsStore.sideWidth = Math.max(200, initialWidth + diffX)
	}
	const endResize = () => {
		sideResizing.value = false
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', endResize)
	}
	document.addEventListener('mousemove', onMouseMove)
	document.addEventListener('mouseup', endResize)
}
//#endregion

//#region 新建按钮
enum NewButtonDropdownOptionsKeyEnum {
	Connection,
	Group,
}
const newButtonDropdownOptions: Array<DropdownOption> = [
	{
		label: () => t('connection.new_connection'),
		icon: () => <Icon height="16" width="16" icon="tabler:layers-linked" />,
		key: NewButtonDropdownOptionsKeyEnum.Connection,
	},
	{
		label: () => t('connection.new_group'),
		icon: () => <Icon height="16" width="16" icon="tabler:folder-plus" />,
		key: NewButtonDropdownOptionsKeyEnum.Group,
	},
]

const handleNewButtonSelect: OnSelectSelect = key => {
	if (key === NewButtonDropdownOptionsKeyEnum.Connection) newConnectionDialogEventHook.trigger({ type: 'new' })
	if (key === NewButtonDropdownOptionsKeyEnum.Group) {
		if (groupClientId) {
			connectionsStore.deleteConnection(groupClientId)
			groupName.value = null
			groupNameInputStatus.value = null
		}
		const clientId = nanoid()
		connectionsStore.newConnection({
			clientId,
			name: null,
			parentClientId: null,
			isGroup: true,
			editType: EditTypeEnum.New,
			children: [],
		})
		groupClientId = clientId
	}
}
//#endregion

//#region 分组编辑
const [DefineGroupNameInput, GroupNameInput] = createReusableTemplate<{
	clientId: Connection['clientId']
	editType: EditTypeEnum
}>()
let groupClientId: Connection['clientId']
const groupName = ref<Connection['name']>()
const groupNameInputStatus = ref<FormValidationStatus>()

function handleGroupNameSubmit(clientId: Connection['clientId']) {
	if (!groupName.value) {
		groupNameInputStatus.value = 'error'
		return
	}
	const connection = structuredClone(connectionsStore.getConnection(clientId))
	connection.name = groupName.value
	connection.editType = null
	connectionsStore.updateConnection(connection)
}

function handleGroupNameCancel(editType: EditTypeEnum, clientId: Connection['clientId']) {
	if (editType === EditTypeEnum.New) connectionsStore.deleteConnection(clientId)
	else {
		const connection = structuredClone(connectionsStore.getConnection(clientId))
		connection.editType = null
		connectionsStore.updateConnection(connection)
	}
}
//#endregion

//#region 连接树渲染
const tree = computed<Array<TreeOption>>(() =>
	connectionsStore.connectionTree.map(node => ({
		key: node.clientId,
		label: node.name,
		isLeaf: !node.isGroup,
		disabled: isNotNil(node.editType),
		prefix: () => generateTreeNodePrefix(node),
		children: node.children.map(child => ({
			key: child.clientId,
			label: child.name,
			isLeaf: !child.isGroup,
			children: [],
			prefix: () => generateTreeNodePrefix(child),
			data: child,
		})),
		data: node,
	})),
)
const treeLabelRender: RenderLabel = ({ option }) =>
	isNotNil(option.data?.['editType']) ? (
		<GroupNameInput clientId={option.data['clientId']} editType={option.data['editType']} />
	) : (
		<NPerformantEllipsis tooltip={{ width: 'trigger' }}>{option.label}</NPerformantEllipsis>
	)
const treeSwitcherIconRender: RenderSwitcherIcon = () => <Icon icon="tabler:chevron-right" />
const treeOverrideDefaultNodeClickBehavior: TreeOverrideNodeClickBehavior = ({ option }) => {
	return option.isLeaf ? 'default' : 'toggleExpand'
}

function generateTreeNodePrefix(node: Connection) {
	return (
		<Icon
			height="16"
			width="16"
			icon={node.isGroup ? 'tabler:folder' : 'tabler:layers-linked'}
			color={node.isGroup ? 'var(--primary-color)' : 'var(--text-color-3)'}
		/>
	)
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
	Ungroup = 'ungroup',
}

const treeDropdownOptionRender: DropdownOptionRender = ({ node, option }) => (
	<NTooltip content-style="white-space: nowrap;" placement="right" disabled={!option.disabled}>
		{{ trigger: () => node, default: () => t('connection.disconnect_first') }}
	</NTooltip>
)

const treeNodeProps: TreeNodeProps = ({ option }) => {
	const connected = connectionsStore.connectionStatus.get(option.data['clientId'])
	return {
		connected,
		onContextmenu({ clientX, clientY }) {
			if (option.disabled) return
			treeDropdownPosition.value = { x: clientX, y: clientY }
			treeDropdownVisible.value = true
			treeDropdownOptions.value = option.isLeaf
				? [
						{
							label: t('common.duplicate'),
							key: TreeDropdownOptionsKeyEnum.Duplicate,
							icon: () => <Icon height="16" width="16" icon="tabler:copy" />,
							data: option.data,
						},
						{
							label: t('common.edit'),
							key: TreeDropdownOptionsKeyEnum.Edit,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
							disabled: connected,
							data: option.data,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKeyEnum.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
							disabled: connected,
							data: option.data,
						},
					]
				: [
						{
							label: t('common.rename'),
							key: TreeDropdownOptionsKeyEnum.Rename,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
							data: option.data,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('connection.ungroup')}</NText>,
							key: TreeDropdownOptionsKeyEnum.Ungroup,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:folder-off" />,
							data: option.data,
						},
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKeyEnum.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
							data: option.data,
						},
					]
		},
	}
}

const handleTreeDropdownSelect: OnDropdownSelect = (value, option) => {
	const clientId = option.data['clientId']
	const connection = structuredClone(connectionsStore.getConnection(clientId))
	if (value === TreeDropdownOptionsKeyEnum.Edit) newConnectionDialogEventHook.trigger({ type: 'edit', clientId })
	if (value === TreeDropdownOptionsKeyEnum.Rename) {
		connection.editType = EditTypeEnum.Rename
		groupName.value = connection.name
		groupNameInputStatus.value = null
		connectionsStore.updateConnection(connection)
	}
	if (value === TreeDropdownOptionsKeyEnum.Duplicate) {
		connection.clientId = connectionsStore.generateClientId()
		connection.name = `${connection.name} (Copy)`
		connectionsStore.newConnection(connection)
	}
	if (value === TreeDropdownOptionsKeyEnum.Ungroup) {
		connection.children.forEach(child => {
			child.parentClientId = null
			connectionsStore.newConnection(child)
		})
		connectionsStore.deleteConnection(clientId)
	}
	if (value === TreeDropdownOptionsKeyEnum.Delete) connectionDeleteConfirmEventHook.trigger(clientId)
	treeDropdownVisible.value = false
}
//#endregion

//#region 连接树拖拽
function handleTreeDrag({ node: _node, dragNode: _dragNode, dropPosition }: TreeDropInfo) {
	const dragNode = connectionsStore.getConnection(_dragNode.key as string)
	const node = connectionsStore.getConnection(_node.key as string)
	const [dragNodeSiblings, dragNodeIndex] = findSiblings(dragNode.clientId, connectionsStore.connectionTree)
	if (!dragNodeSiblings || dragNodeIndex === null || (dropPosition === 'inside' && (!node.isGroup || dragNode.isGroup)))
		return
	dragNodeSiblings.splice(dragNodeIndex, 1)
	switch (dropPosition) {
		case 'inside':
			dragNode.parentClientId = node.clientId
			node.children = node.children ? [dragNode, ...node.children] : [dragNode]
			break
		case 'before':
		case 'after':
			const [nodeSiblings, nodeIndex] = findSiblings(node.clientId, connectionsStore.connectionTree)
			if (!nodeSiblings || nodeIndex === null) return
			dropPosition === 'before'
				? nodeSiblings.splice(nodeIndex, 0, dragNode)
				: nodeSiblings.splice(nodeIndex + 1, 0, dragNode)
			break
	}
	connectionsStore.connectionTree.forEach(node => {
		if (node.parentClientId) {
			const isExist = connectionsStore
				.getConnection(node.parentClientId)
				.children.some(child => child.clientId === node.clientId)
			if (!isExist) node.parentClientId = null
		}
	})
	connectionsStore.updateConnectionTree(connectionsStore.connectionTree)
}

function findSiblings(
	clientId: Connection['clientId'],
	tree?: Array<Connection>,
): [Array<Connection>, number] | [null, null] {
	if (!tree) return [null, null]
	const index = tree.findIndex(node => node.clientId === clientId)
	if (index !== -1) return [tree, index]
	for (const node of tree) {
		const [siblings, siblingIndex] = findSiblings(clientId, node.children)
		if (siblings) return [siblings, siblingIndex]
	}
	return [null, null]
}
//#endregion
</script>

<template>
	<DefineGroupNameInput v-slot="{ clientId, editType }">
		<NFlex :wrap="false" align="center" :size="4">
			<NInput size="small" autofocus :status="groupNameInputStatus" v-model:value.trim="groupName" />
			<NButton quaternary size="tiny" type="success" @click.stop="handleGroupNameSubmit(clientId)">
				<template #icon> <Icon icon="tabler:check" /></template>
			</NButton>
			<NButton quaternary size="tiny" type="error" @click.stop="handleGroupNameCancel(editType, clientId)">
				<template #icon> <Icon icon="tabler:x" /></template>
			</NButton>
		</NFlex>
	</DefineGroupNameInput>
	<div class="side" :collapse="connectionsStore.sideCollapsed" :resizing="sideResizing">
		<div class="header">
			<span>{{ t('connection.connections') }}</span>
			<NDropdown
				trigger="click"
				:options="newButtonDropdownOptions"
				size="small"
				placement="bottom-start"
				@select="handleNewButtonSelect"
			>
				<NButton size="small" quaternary>
					<template #icon> <Icon icon="tabler:plus" /></template>
				</NButton>
			</NDropdown>
		</div>
		<div class="body">
			<NTree
				:data="tree"
				block-line
				expand-on-click
				virtual-scroll
				draggable
				show-line
				:render-label="treeLabelRender"
				:render-switcher-icon="treeSwitcherIconRender"
				:override-default-node-click-behavior="treeOverrideDefaultNodeClickBehavior"
				:node-props="treeNodeProps"
				:cancelable="false"
				:selected-keys="[selectedClientId]"
				@drop="handleTreeDrag"
				@update:selected-keys="value => connectionSelectedUpdateEventHook.trigger(value[0])"
			/>
		</div>
		<NDropdown
			:options="treeDropdownOptions"
			:show="treeDropdownVisible"
			:x="treeDropdownPosition.x"
			:y="treeDropdownPosition.y"
			:render-option="treeDropdownOptionRender"
			placement="bottom-start"
			size="small"
			to=".main"
			@clickoutside="treeDropdownVisible = false"
			@select="handleTreeDropdownSelect"
		/>
		<button
			class="side_collapse"
			:collapse="connectionsStore.sideCollapsed"
			@click="connectionsStore.sideCollapsed = !connectionsStore.sideCollapsed"
		>
			<Icon height="18" width="18" icon="tabler:chevron-left" />
		</button>
		<div class="drag" @mousedown="handleSideDrag" />
	</div>
</template>

<style scoped lang="scss">
.side {
	position: relative;
	width: v-bind(sideWidth);
	max-width: v-bind(sideWidth);
	display: flex;
	flex-direction: column;
	transition: all 0.2s var(--cubic-bezier-ease-in-out);
	background-color: var(--card-color);
	border-radius: var(--border-radius);
	border: 1px solid var(--border-color);
	z-index: 1;

	&[collapse='true'] {
		transform: translateX(-17px);
		max-width: 0;
	}

	&[resizing='true'] {
		transition: none;
	}

	&_collapse {
		position: absolute;
		right: -2px;
		top: 50%;
		height: 22px;
		width: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translate(50%, 50%);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		cursor: pointer;
		background-color: var(--card-color);
		padding: 0px;
		color: var(--text-color-3);
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
		z-index: 2;

		&[collapse='true'] {
			transform: translate(200%, 50%);

			svg {
				transform: rotate(180deg);
			}
		}

		&:hover {
			box-shadow: var(--box-shadow-1);
			color: var(--text-color-2);
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
	height: 45px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: var(--font-size-large);
	font-weight: bold;
	transition: all 0.2s var(--cubic-bezier-ease-in-out);
	white-space: nowrap;
	overflow: hidden;
	padding: 0 8px;
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

	:deep(.n-tree-node) {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			right: 8px;
			top: 8px;
			height: 8px;
			width: 8px;
			border-radius: 4px;
		}

		&[connected='true']::after {
			background-color: var(--success-color);
		}

		&[connected='false']::after {
			background-color: var(--icon-color);
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

.drag {
	position: absolute;
	right: -4.5px;
	top: 0;
	bottom: 0;
	width: 4px;
	cursor: e-resize;
	transition: all 0.2s var(--cubic-bezier-ease-in-out);

	&:hover {
		background-color: var(--primary-color);
	}
}
</style>
