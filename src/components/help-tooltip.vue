<script setup lang="ts">
import { type IconifyIconSize } from '@iconify/vue'
import { type PopoverProps } from 'naive-ui'

const {
	content,
	size = 16,
	color,
	tooltipProps,
} = defineProps<{ content: string; size?: IconifyIconSize; color?: string; tooltipProps?: PopoverProps }>()
</script>

<template>
	<NTooltip v-bind="tooltipProps" to="body">
		<template #trigger>
			<Icon class="help-tooltip_icon" :height="size" :width="size" :color icon="tabler:help" />
		</template>
		{{ content }}
	</NTooltip>
</template>

<style scoped lang="scss">
.help-tooltip {
	&_icon {
		cursor: help;
	}
}
</style>
