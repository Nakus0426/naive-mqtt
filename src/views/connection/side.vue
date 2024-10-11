<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { type DropdownOption } from 'naive-ui'
import { Icon } from '@iconify/vue'

const { t } = useI18n<{ message: MessageSchema }>()

const sideCollapsed = ref(false)

//#region 头部吸顶
const headerSticky = ref(false)

function handleHeaderStickyUpdate(direction: 'top' | 'bottom', value: boolean) {
	if (direction !== 'top') return
	headerSticky.value = value
}
//#endregion

const addButtonOptions: Array<DropdownOption> = [
	{
		label: () => t('connection.newConnection'),
		icon: () => <Icon height="14" width="14" icon="tabler:layers-linked" />,
		key: 'connection',
	},
	{
		label: () => t('connection.newGroup'),
		icon: () => <Icon height="14" width="14" icon="tabler:folder" />,
		key: 'group',
	},
]
</script>

<template>
	<div class="side" :collapse="sideCollapsed">
		<div class="header" :sticky="headerSticky">
			<span>{{ t('main.menu.connection') }}</span>
			<NDropdown trigger="click" :options="addButtonOptions" size="small">
				<NButton size="tiny">
					<Icon icon="tabler:plus" />
				</NButton>
			</NDropdown>
		</div>
		<OverlayScrollbar class="body" @sticky="handleHeaderStickyUpdate">
			<h1 v-for="item in 50">Body</h1>
		</OverlayScrollbar>
		<button class="side_collapse" :collapse="sideCollapsed" @click="sideCollapsed = !sideCollapsed">
			<Icon height="18" width="18" icon="tabler:chevron-left" />
		</button>
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
}
</style>
