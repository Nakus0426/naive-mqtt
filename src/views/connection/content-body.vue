<script setup lang="ts">
import { useConnectionsStore } from '@/store/modules/connections'

const connectionsStore = useConnectionsStore()

//#region footer高度
const footerHeight = computed(() => `${connectionsStore.contentFooterHeight}px`)
const footerResizing = ref(false)

function handleFooterDrag({ clientY }: MouseEvent) {
	footerResizing.value = true
	const startY = clientY
	const initialWidth = connectionsStore.contentFooterHeight
	const onMouseMove = ({ clientY: _clientY }: MouseEvent) => {
		if (!footerResizing) return

		const diffY = startY - _clientY
		connectionsStore.contentFooterHeight = Math.max(100, initialWidth + diffY)
	}
	const endResize = () => {
		footerResizing.value = false
		document.removeEventListener('mousemove', onMouseMove)
		document.removeEventListener('mouseup', endResize)
	}
	document.addEventListener('mousemove', onMouseMove)
	document.addEventListener('mouseup', endResize)
}
//#endregion
</script>

<template>
	<div class="content-body">
		<div class="body"></div>
		<div class="footer" :resizing="footerResizing" :collapse="connectionsStore.contentFooterCollapsed">
			<button
				class="footer_collapse"
				:collapse="connectionsStore.contentFooterCollapsed"
				@click="connectionsStore.contentFooterCollapsed = !connectionsStore.contentFooterCollapsed"
			>
				<Icon height="18" width="18" icon="tabler:chevron-down" />
			</button>
			<div class="footer_drag" @mousedown="handleFooterDrag" />
			<div class="footer_header">
				<NInput size="small" />
				<QosSelect size="small" style="width: 150px; min-width: 150px" />
				<NButton size="small" tertiary>
					<template #icon>
						<Icon icon="tabler:check" color="var(--success-color)" />
					</template>
					保留消息
				</NButton>
				<NButton size="small" tertiary>
					<template #icon>
						<Icon height="14" width="14" icon="tabler:dots-vertical" />
					</template>
				</NButton>
			</div>
			<Editor class="footer_body" />
			<NButton class="footer_send" type="primary" circle>
				<template #icon>
					<Icon icon="tabler:send-2" />
				</template>
			</NButton>
		</div>
	</div>
</template>

<style scoped lang="scss">
.content-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.body {
	flex: 1;
	background-color: var(--button-color-2);
}

.footer {
	display: flex;
	flex-direction: column;
	position: relative;
	height: v-bind(footerHeight);
	max-height: v-bind(footerHeight);
	border-top: 1px solid var(--border-color);
	transition: all 0.2s var(--cubic-bezier-ease-in-out);
	z-index: 1;

	&[collapse='true'] {
		margin-top: -17px;
		transform: translateY(20px);
		max-height: 0;
	}

	&[resizing='true'] {
		transition: none;
	}

	&_collapse {
		position: absolute;
		top: -11px;
		left: 50%;
		height: 22px;
		width: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateX(-50%);
		border-radius: 12px;
		border: 1px solid var(--border-color);
		cursor: pointer;
		background-color: var(--card-color);
		padding: 0;
		color: var(--text-color-3);
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
		z-index: 2;

		&[collapse='true'] {
			transform: translate(-50%, calc(0px - 100% - 16px));

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

	&_drag {
		position: absolute;
		top: -2px;
		left: 0;
		right: 0;
		height: 4px;
		cursor: n-resize;
		transition: all 0.2s var(--cubic-bezier-ease-in-out);

		&:hover {
			background-color: var(--primary-color);
		}
	}

	&_header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 8px;
		border-bottom: 1px solid var(--border-color);

		:deep(.n-input),
		:deep(.n-base-selection-label) {
			background-color: var(--button-color-2);
		}

		:deep(.n-input__border),
		:deep(.n-base-selection__border) {
			border: none;
		}
	}

	&_body {
		flex: 1;
	}

	&_send {
		position: absolute;
		right: 8px;
		bottom: 38px;
		box-shadow: var(--box-shadow-1);
	}
}
</style>
