<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { EditTypeEnum, type Subscription, useConnectionsStore } from '@/store/modules/connections'
import { type TreeOption, type DropdownOption, type TreeDropInfo, NText, NPerformantEllipsis, NTooltip } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { type OnUpdateValueImpl as OnSelectSelect } from 'naive-ui/es/select/src/interface'
import {
	type RenderLabel,
	type TreeOverrideNodeClickBehavior,
	type TreeNodeProps,
	type RenderSwitcherIcon,
} from 'naive-ui/lib/tree/src/interface'
import {
	type OnUpdateValueImpl as OnDropdownSelect,
	type RenderOptionImpl as DropdownOptionRender,
} from 'naive-ui/es/dropdown/src/interface'
import NewSubscriptionDialog from './new-subscription-dialog.vue'
import { nanoid } from 'nanoid'
import { useContent } from './use-content'
import { type FormValidationStatus } from 'naive-ui/es/form/src/interface'
import { isNotNil, lowerFirst } from 'es-toolkit'

const connectionsStore = useConnectionsStore()
const { clientId, connected, subscriptionTree, subscriptionStatus, subscribe, unsubscribe } = useContent()
const { t } = useI18n<{ message: MessageSchema }>()
const { copy, copied } = useClipboard()

//#region 宽度
const width = computed(() => `${connectionsStore.contentSideWidth}px`)
let sideResizing = false

function handleSideDrag({ clientX }: MouseEvent) {
	sideResizing = true
	const startX = clientX
	const initialWidth = connectionsStore.contentSideWidth
	const onMouseMove = ({ clientX: _clientX }: MouseEvent) => {
		if (!sideResizing) return

		const diffX = _clientX - startX
		connectionsStore.contentSideWidth = Math.max(200, initialWidth + diffX)
	}
	const endResize = () => {
		sideResizing = false
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', endResize)
	}
	document.addEventListener('mousemove', onMouseMove)
	document.addEventListener('mouseup', endResize)
}
//#endregion

//#region 添加按钮
enum NewButtonDropdownOptionsKeyEnum {
	Subscription,
	Group,
}
const newButtonDropdownOptions: Array<DropdownOption> = [
	{
		label: () => t('connection.new_subscription'),
		icon: () => <Icon height="16" width="16" icon="tabler:rss" />,
		key: NewButtonDropdownOptionsKeyEnum.Subscription,
	},
	{
		label: () => t('connection.new_group'),
		icon: () => <Icon height="16" width="16" icon="tabler:folder-plus" />,
		key: NewButtonDropdownOptionsKeyEnum.Group,
	},
]
const newSubscriptionDialogRef = useTemplateRef('newSubscriptionDialog')

const handleNewButtonSelect: OnSelectSelect = key => {
	if (key === NewButtonDropdownOptionsKeyEnum.Subscription) newSubscriptionDialogRef.value.open(clientId)
	if (key === NewButtonDropdownOptionsKeyEnum.Group) {
		if (groupId) {
			connectionsStore.deleteSubscription(clientId, groupId)
			groupName.value = null
			groupNameInputStatus.value = null
		}
		const id = nanoid()
		connectionsStore.newSubscription({
			id,
			clientId,
			name: null,
			editType: EditTypeEnum.New,
			isGroup: true,
			children: [],
			qos: null,
		})
		groupName.value = id
	}
}
//#endregion

//#region 渲染树
const tree = computed<Array<TreeOption>>(() => {
	return subscriptionTree.value.map(node => ({
		key: node.id,
		label: node.name,
		isLeaf: !node.isGroup,
		disabled: isNotNil(node.editType),
		prefix: () => generateTreeNodePrefix(node),
		children: node.children.map(child => ({
			key: child.id,
			label: child.name,
			isLeaf: !child.isGroup,
			prefix: () => generateTreeNodePrefix(child),
			children: [],
			data: child,
		})),
		data: node,
	}))
})
const treeLabelRender: RenderLabel = ({ option }) => {
	const editType = option.data['editType']
	return isNotNil(editType) ? (
		<GroupNameInput clientId={option.data['clientId']} editType={editType} id={option.data['id']} />
	) : (
		<NPerformantEllipsis tooltip={{ width: 'trigger' }}>{option.label}</NPerformantEllipsis>
	)
}
const treeSwitcherIconRender: RenderSwitcherIcon = () => <Icon icon="tabler:chevron-right" />
const treeOverrideDefaultNodeClickBehavior: TreeOverrideNodeClickBehavior = ({ option }) => {
	return option.isLeaf ? (connected.value ? 'default' : 'none') : 'toggleExpand'
}
function generateTreeNodePrefix(node: Subscription) {
	return (
		<Icon
			height="16"
			width="16"
			icon={node.isGroup ? 'tabler:folder' : 'tabler:rss'}
			color={node.isGroup ? 'var(--primary-color)' : 'var(--color)'}
		/>
	)
}
//#endregion

//#region 右键菜单
enum TreeDropdownOptionsKeyEnum {
	Rename = 'rename',
	CopyTopic = 'copyTopic',
	Delete = 'delete',
	Edit = 'edit',
	Enable = 'enable',
	Disable = 'disable',
}
const treeDropdownPosition = ref({ x: null, y: null })
const treeDropdownVisible = ref(false)
const treeDropdownOptions = ref<Array<DropdownOption>>()
const dropdownOptionRender: DropdownOptionRender = ({ node, option }) => {
	const { disabled, tooltipContent } = option
	return (
		<NTooltip content-style="white-space: nowrap;" placement="right" disabled={!disabled}>
			{{ trigger: () => node, default: () => t(tooltipContent as string) }}
		</NTooltip>
	)
}
const treeNodeProps: TreeNodeProps = ({ option }) => {
	const { enabled, id } = option.data as Subscription
	return {
		style: { '--color': option.data['color'] },
		enabled,
		onContextmenu({ clientX, clientY }) {
			if (option.disabled) return
			treeDropdownPosition.value = { x: clientX, y: clientY }
			treeDropdownVisible.value = true
			treeDropdownOptions.value = option.isLeaf
				? [
						{
							label: () => (
								<NText type={enabled ? 'error' : 'success'}>{t(`common.${enabled ? 'disable' : 'enable'}`)}</NText>
							),
							key: enabled ? TreeDropdownOptionsKeyEnum.Disable : TreeDropdownOptionsKeyEnum.Enable,
							icon: () => (
								<Icon
									height="16"
									width="16"
									icon={enabled ? 'tabler:x' : 'tabler:check'}
									color={`var(--${enabled ? 'error' : 'success'}-color)`}
								/>
							),
							data: option.data,
						},
						{ key: nanoid(), type: 'divider' },
						{
							label: t('connection.copy_topic'),
							key: TreeDropdownOptionsKeyEnum.CopyTopic,
							icon: () => <Icon height="16" width="16" icon="tabler:clipboard-copy" />,
							data: option.data,
						},
						{
							label: t('common.edit'),
							key: TreeDropdownOptionsKeyEnum.Edit,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
							disabled: subscriptionStatus.value.has(id) && subscriptionStatus.value.get(id),
							data: option.data,
							tooltipContent: 'connection.disabled_first',
						},
						{ key: nanoid(), type: 'divider' },
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
						{ key: nanoid(), type: 'divider' },
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

const handleTreeDropdownSelect: OnDropdownSelect = async (value, option) => {
	const isGroup = option.data['isGroup']
	const id = option.data['id']
	if (value === TreeDropdownOptionsKeyEnum.Enable) {
		if (connected.value) subscribe(toRaw(option.data as Subscription))
		else {
			option.data['enabled'] = true
			connectionsStore.updateSubscription(option.data as Subscription)
		}
	}
	if (value === TreeDropdownOptionsKeyEnum.Disable) {
		if (connected.value) unsubscribe(toRaw(option.data as unknown as Subscription))
		else {
			option.data['enabled'] = false
			connectionsStore.updateSubscription(option.data as Subscription)
		}
	}
	if (value === TreeDropdownOptionsKeyEnum.Rename) {
		const subscription = structuredClone(await connectionsStore.getSubscription(clientId, id))
		subscription.editType = EditTypeEnum.Rename
		groupName.value = subscription.name
		groupNameInputStatus.value = null
		connectionsStore.updateSubscription(subscription)
	}
	if (value === TreeDropdownOptionsKeyEnum.CopyTopic) {
		copy(option.data['topic'])
		watchOnce(copied, value => value && window.$message.success(t('common.copy_success')))
	}
	if (value === TreeDropdownOptionsKeyEnum.Edit) {
		newSubscriptionDialogRef.value.edit(clientId, id)
	}
	if (value === TreeDropdownOptionsKeyEnum.Delete) {
		const title = t('common.delete')
		const content = () => (
			<div style="padding: 20px 26px">
				{t('common.delete_confirm', { name: lowerFirst(t(`connection.${isGroup ? 'group' : 'subscription'}`)) })}
			</div>
		)
		window.$dialog.warning({
			title,
			content,
			positiveText: t('common.confirm'),
			negativeText: t('common.cancel'),
			onPositiveClick: async () => {
				if (subscriptionStatus.value.get(id)) await unsubscribe(toRaw(option.data as Subscription))
				connectionsStore.deleteSubscription(clientId, id)
			},
		})
	}
	treeDropdownVisible.value = false
}
//#endregion

//#region 分组编辑
const [DefineGroupNameInput, GroupNameInput] = createReusableTemplate<{
	id: Subscription['id']
	clientId: Subscription['clientId']
	editType: EditTypeEnum
}>()
let groupId: Subscription['id']
const groupName = ref<Subscription['name']>()
const groupNameInputStatus = ref<FormValidationStatus>()

async function handleGroupNameSubmit(id: Subscription['id']) {
	if (!groupName.value) {
		groupNameInputStatus.value = 'error'
		return
	}
	const subscription = structuredClone(await connectionsStore.getSubscription(clientId, id))
	subscription.name = groupName.value
	subscription.editType = null
	connectionsStore.updateSubscription(subscription)
}

async function handleGroupNameCancel(
	editType: EditTypeEnum,
	clientId: Subscription['clientId'],
	id: Subscription['id'],
) {
	if (editType === EditTypeEnum.New) connectionsStore.deleteSubscription(clientId, id)
	else {
		const subscription = structuredClone(await connectionsStore.getSubscription(clientId, id))
		subscription.editType = null
		connectionsStore.updateSubscription(subscription)
	}
}
//#endregion

//#region 拖拽
async function handleTreeDrag({ node: _node, dragNode: _dragNode, dropPosition }: TreeDropInfo) {
	const tree = structuredClone(toRaw(subscriptionTree.value))
	const dragNode = findNode(tree, _dragNode.key as string)
	const node = findNode(tree, _node.key as string)
	const [dragNodeSiblings, dragNodeIndex] = findSiblings(dragNode.id, tree)
	if (!dragNodeSiblings || dragNodeIndex === null || (dropPosition === 'inside' && (!node.isGroup || dragNode.isGroup)))
		return
	dragNodeSiblings.splice(dragNodeIndex, 1)
	switch (dropPosition) {
		case 'inside':
			dragNode.parentId = node.id
			node.children = node.children ? [dragNode, ...node.children] : [dragNode]
			break
		case 'before':
		case 'after':
			const [nodeSiblings, nodeIndex] = findSiblings(node.id, tree)
			if (!nodeSiblings || nodeIndex === null) return
			dropPosition === 'before'
				? nodeSiblings.splice(nodeIndex, 0, dragNode)
				: nodeSiblings.splice(nodeIndex + 1, 0, dragNode)
			break
	}
	for (let i = 0, len = tree.length; i < len; i++) {
		const item = tree[i]
		if (!item.parentId) continue
		const parent = findNode(tree, item.parentId)
		if (!parent.children.some(child => child.id === item.id)) item.parentId = null
	}
	await connectionsStore.updateSubscriptionTree(clientId, tree)
}

function findSiblings(
	id: Subscription['id'],
	tree?: Array<Subscription>,
): [Array<Subscription>, number] | [null, null] {
	if (!tree) return [null, null]
	const index = tree.findIndex(node => node.id === id)
	if (index !== -1) return [tree, index]
	for (const node of tree) {
		const [siblings, siblingIndex] = findSiblings(id, node.children)
		if (siblings) return [siblings, siblingIndex]
	}
	return [null, null]
}

function findNode(tree: Array<Subscription>, id: Subscription['id']) {
	for (let i = 0, len = tree.length; i < len; i++) {
		const node = tree[i]
		if (node.id === id) return node
		if (node.children.length > 0) {
			const child = node.children.find(child => child.id === id)
			if (child) return child
		}
	}
	return null
}
//#endregion
</script>

<template>
	<DefineGroupNameInput v-slot="{ id, clientId, editType }">
		<NFlex :wrap="false" align="center" :size="4">
			<NInput size="small" autofocus :status="groupNameInputStatus" v-model:value.trim="groupName" />
			<NButton quaternary size="tiny" type="success" @click.stop="handleGroupNameSubmit(id)">
				<template #icon> <Icon icon="tabler:check" /></template>
			</NButton>
			<NButton quaternary size="tiny" type="error" @click.stop="handleGroupNameCancel(editType, clientId, id)">
				<template #icon> <Icon icon="tabler:x" /></template>
			</NButton>
		</NFlex>
	</DefineGroupNameInput>
	<div class="content-side">
		<div class="header">
			<span>{{ t('connection.subscriptions') }}</span>
			<NDropdown
				:options="newButtonDropdownOptions"
				trigger="click"
				size="small"
				placement="bottom-start"
				@select="handleNewButtonSelect"
			>
				<NButton size="tiny" quaternary>
					<template #icon> <Icon icon="tabler:plus" /></template>
				</NButton>
			</NDropdown>
		</div>
		<div class="body">
			<NTree
				block-line
				expand-on-click
				virtual-scroll
				draggable
				show-line
				:data="tree"
				:render-label="treeLabelRender"
				:render-switcher-icon="treeSwitcherIconRender"
				:override-default-node-click-behavior="treeOverrideDefaultNodeClickBehavior"
				:node-props="treeNodeProps"
				@drop="handleTreeDrag"
			/>
			<NDropdown
				placement="bottom-start"
				size="small"
				to=".main"
				:options="treeDropdownOptions"
				:show="treeDropdownVisible"
				:x="treeDropdownPosition.x"
				:y="treeDropdownPosition.y"
				:render-option="dropdownOptionRender"
				@clickoutside="treeDropdownVisible = false"
				@select="handleTreeDropdownSelect"
			/>
		</div>
		<div class="content-side_drag" @mousedown="handleSideDrag" />
		<NewSubscriptionDialog ref="newSubscriptionDialog" />
	</div>
</template>

<style scoped lang="scss">
.content-side {
	position: relative;
	width: v-bind(width);
	max-width: v-bind(width);
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 8px 8px 0 8px;
	background-color: var(--card-color);
	border-radius: var(--border-radius);
	border: 1px solid var(--border-color);

	&_drag {
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
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-weight: bold;
}

.body {
	flex: 1;

	:deep(.n-tree) {
		&:has(.n-empty) {
			display: flex;
			flex: 1;
			align-items: center;
		}
	}

	:deep(.n-tree-node) {
		position: relative;

		&[enabled='true'] {
			background: var(--tab-color);
		}

		&[enabled='false'] {
			background: transparent;
		}
	}

	:deep(.n-tree-node-switcher),
	:deep(.n-tree-node-content) {
		height: 40px;
		min-height: 40px;
	}
}
</style>
