<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { type DropdownOption, NPerformantEllipsis, NText } from 'naive-ui'
import { Icon } from '@iconify/vue'
import {
	type RenderPrefix,
	type RenderLabel,
	type TreeOverrideNodeClickBehavior,
	type TreeNodeProps,
} from 'naive-ui/lib/tree/src/interface'
import { type OnUpdateValue } from 'naive-ui/es/select/src/interface'
import NewConnectionDialog from './new-connection-dialog.vue'

const { t } = useI18n<{ message: MessageSchema }>()

const sideCollapsed = ref(false)

//#region 头部吸顶
const headerSticky = ref(false)

function handleHeaderStickyUpdate(direction: 'top' | 'bottom', value: boolean) {
	if (direction !== 'top') return
	headerSticky.value = value
}
//#endregion

//#region 新建按钮
const newConnectionDialogRef = useTemplateRef('newConnectionDialog')
enum NewButtonDropdownOptionsKey {
	Connection = 'connection',
	Group = 'group',
}
const newButtonDropdownOptions: Array<DropdownOption> = [
	{
		label: () => t('connection.new_connection'),
		icon: () => <Icon height="16" width="16" icon="tabler:layers-linked" />,
		key: NewButtonDropdownOptionsKey.Connection,
	},
	{
		label: () => t('connection.new_group'),
		icon: () => <Icon height="16" width="16" icon="tabler:folder" />,
		key: NewButtonDropdownOptionsKey.Group,
	},
]

const handleNewButtonSelect: OnUpdateValue = key => {
	if (key === NewButtonDropdownOptionsKey.Connection) newConnectionDialogRef.value.open()
}
//#endregion

//#region 连接树渲染
const tree = [
	{
		key: '1',
		label: 'group1',
		isLeaf: false,
		children: [{ key: '1-1', label: 'connection1', isLeaf: true }],
	},
	{ key: '2', label: 'group1', isLeaf: false, children: [] },
	{ key: '3', label: 'connection1', isLeaf: true },
]

const treePrefixRender: RenderPrefix = ({ option }) => {
	return (
		<Icon
			height="16"
			width="16"
			icon={option.isLeaf ? 'tabler:point-filled' : 'tabler:folder'}
			color={option.isLeaf ? 'var(--text-color-2)' : 'var(--primary-color)'}
		/>
	)
}
const treeLabelRender: RenderLabel = ({ option }) => (
	<NPerformantEllipsis tooltip={{ width: 'trigger' }}>{option.label}</NPerformantEllipsis>
)
const treeOverrideDefaultNodeClickBehavior: TreeOverrideNodeClickBehavior = ({ option }) => {
	return option.isLeaf ? 'default' : 'toggleExpand'
}
//#endregion

//#region 连接树右键菜单
const treeDropdownPosition = ref({ x: null, y: null })
const treeDropdownVisible = ref(false)
const treeDropdownOptions = ref<Array<DropdownOption>>()
enum TreeDropdownOptionsKey {
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
							key: TreeDropdownOptionsKey.Duplicate,
							icon: () => <Icon height="16" width="16" icon="tabler:copy" />,
						},
						{
							label: t('common.edit'),
							key: TreeDropdownOptionsKey.Edit,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKey.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
						},
					]
				: [
						{
							label: t('common.rename'),
							key: TreeDropdownOptionsKey.Rename,
							icon: () => <Icon height="16" width="16" icon="tabler:edit" />,
						},
						{ key: 'divider', type: 'divider' },
						{
							label: () => <NText type="error">{t('common.delete')}</NText>,
							key: TreeDropdownOptionsKey.Delete,
							icon: () => <Icon height="16" width="16" color="var(--error-color)" icon="tabler:trash" />,
						},
					]
		},
	}
}
//#endregion
</script>

<template>
	<div class="side" :collapse="sideCollapsed">
		<div class="header" :sticky="headerSticky">
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
		<OverlayScrollbar class="body" @sticky="handleHeaderStickyUpdate">
			<NTree
				:data="tree"
				block-line
				expand-on-click
				:render-prefix="treePrefixRender"
				:render-label="treeLabelRender"
				:override-default-node-click-behavior="treeOverrideDefaultNodeClickBehavior"
				:node-props="treeNodeProps"
			/>
		</OverlayScrollbar>
		<NDropdown
			:options="treeDropdownOptions"
			:show="treeDropdownVisible"
			:x="treeDropdownPosition.x"
			:y="treeDropdownPosition.y"
			placement="bottom-start"
			size="small"
			to=".main"
			@clickoutside="treeDropdownVisible = false"
		/>
		<button class="side_collapse" :collapse="sideCollapsed" @click="sideCollapsed = !sideCollapsed">
			<Icon height="18" width="18" icon="tabler:chevron-left" />
		</button>
		<NewConnectionDialog ref="newConnectionDialog" />
	</div>
</template>

<style scoped lang="scss">
.side {
	position: relative;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 300px;
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--border-color);
	transition: all 0.2s var(--cubic-bezier-ease-in-out);

	&[collapse='true'] {
		transform: translateX(-100%);
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
			transform: translateX(110%);

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
	padding: 8px;
	font-size: var(--font-size-large);
	font-weight: bold;
	border-bottom: 1px solid transparent;
	transition: all 0.2s var(--cubic-bezier-ease-in-out);

	&[sticky='true'] {
		border-bottom-color: var(--border-color);
	}
}

.body {
	flex: 1;
	padding: 0px 8px;

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
