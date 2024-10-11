<script setup lang="ts">
import { useOverlayScrollbars } from 'overlayscrollbars-vue'
import { type OverflowBehavior } from 'overlayscrollbars'
import 'overlayscrollbars/overlayscrollbars.css'

const { x = 'hidden', y = 'scroll' } = defineProps<{ x?: OverflowBehavior; y?: OverflowBehavior }>()
const emit = defineEmits<{ sticky: ['top' | 'bottom', boolean] }>()

const containerRef = useTemplateRef('container')
const [init, instance] = useOverlayScrollbars({
	options: {
		scrollbars: { autoHide: 'leave', clickScroll: 'instant' },
		overflow: { x, y },
	},
	events: {
		initialized(instance) {
			useIntersectionObserver(stickyTopRef, ([{ isIntersecting }]) => emit('sticky', 'top', !isIntersecting))
			useIntersectionObserver(stickyBottomRef, ([{ isIntersecting }]) => emit('sticky', 'bottom', !isIntersecting))
		},
	},
	defer: true,
})
onMounted(() => init({ target: containerRef.value, elements: { viewport: containerRef.value } }))

const stickyTopRef = useTemplateRef('stickyTop')
const stickyBottomRef = useTemplateRef('stickyBottom')
</script>

<template>
	<div ref="container">
		<div ref="stickyTop" />
		<slot name="default" />
		<div ref="stickyBottom" />
	</div>
</template>

<style scoped lang="scss"></style>
