<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { type DropdownOption, type TreeDropInfo, NPerformantEllipsis, NText, TreeOption } from 'naive-ui'
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
import { type Connection, useConnectionsStore } from '@/store/modules/connections'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionStore = useConnectionsStore()

//#region 宽度
const sideCollapsed = ref(false)
const sideWidth = computed(() => `${connectionStore.sideWidth}px`)
const sideResizing = ref(false)

function handleSideDrag({ clientX }: MouseEvent) {
	sideResizing.value = true
	const startX = clientX
	const initialWidth = connectionStore.sideWidth
	const onMouseMove = ({ clientX: _clientX }: MouseEvent) => {
		if (!sideResizing) return

		const diffX = _clientX - startX
		connectionStore.sideWidth = Math.max(200, initialWidth + diffX)
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
const tree = computed<Array<TreeOption>>(() => {
	return connectionStore.connectionTree.map(node => ({
		key: node.clientId,
		label: node.name,
		isLeaf: !node.isGroup,
		children: node.children.map(child => ({
			key: child.clientId,
			label: child.name,
			isLeaf: !child.isGroup,
			children: [],
			data: child,
		})),
		data: node,
	}))
})
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
							data: option.data,
						},
						{
							label: t('common.edit'),
							key: TreeDropdownOptionsKeyEnum.Edit,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
							data: option.data,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKeyEnum.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
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
	const isGroup = option.data['isGroup']
	const clientId = option.data['clientId']
	if (value === TreeDropdownOptionsKeyEnum.Edit) newConnectionDialogRef.value.open(clientId)
	if (value === TreeDropdownOptionsKeyEnum.Rename) newGroupDialogRef.value.open(clientId)
	if (value === TreeDropdownOptionsKeyEnum.Duplicate) {
		const connection = structuredClone(connectionStore.getConnection(clientId))
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
				connectionStore.deleteConnection(clientId as string)
			},
		})
	}
	treeDropdownVisible.value = false
}
//#endregion

//#region 连接树拖拽
function handleTreeDrag({ node: _node, dragNode: _dragNode, dropPosition }: TreeDropInfo) {
	const dragNode = connectionStore.getConnection(_dragNode.key as string)
	const node = connectionStore.getConnection(_node.key as string)
	const [dragNodeSiblings, dragNodeIndex] = findSiblings(dragNode.clientId, connectionStore.connectionTree)
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
			const [nodeSiblings, nodeIndex] = findSiblings(node.clientId, connectionStore.connectionTree)
			if (!nodeSiblings || nodeIndex === null) return
			dropPosition === 'before'
				? nodeSiblings.splice(nodeIndex, 0, dragNode)
				: nodeSiblings.splice(nodeIndex + 1, 0, dragNode)
			break
	}
	connectionStore.connectionTree.forEach(node => {
		if (node.parentClientId) {
			const isExist = connectionStore
				.getConnection(node.parentClientId)
				.children.some(child => child.clientId === node.clientId)
			if (!isExist) node.parentClientId = null
		}
	})
	connectionStore.updateConnectionTree(connectionStore.connectionTree)
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
	<div class="side" :collapse="sideCollapsed" :resizing="sideResizing">
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
				:data="tree"
				block-line
				expand-on-click
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
	gap: 8px;
	border-right: 1px solid var(--border-color);
	transition: all 0.2s var(--cubic-bezier-ease-in-out);

	&[collapse='true'] {
		transform: translateX(-17px);
		max-width: 0;
	}

	&[resizing='true'] {
		transition: none;
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

.drag {
	position: absolute;
	right: -2px;
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
