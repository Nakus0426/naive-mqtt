<script setup lang="ts">
import { useConnectionsStore } from '@/store/modules/connections'

const connectionsStore = useConnectionsStore()

//#region 宽度
const width = computed(() => `${connectionsStore.contentSideWidth}px`)
let sideResizing = false

function handleBorderDrag({ clientX }: MouseEvent) {
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
</script>

<template>
	<div class="content-side">
		<div class="border-drag" @mousedown="handleBorderDrag" />
	</div>
</template>

<style scoped lang="scss">
.content-side {
	position: relative;
	width: v-bind(width);
	max-width: v-bind(width);
	border-right: 1px solid var(--border-color);
}

.border-drag {
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
