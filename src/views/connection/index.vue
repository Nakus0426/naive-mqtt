<script setup lang="ts">
import Side from './side.vue'
</script>

<template>
	<div class="connection">
		<Side />
		<div class="content"></div>
	</div>
</template>

<style scoped lang="scss">
.connection {
	height: 100%;
	width: 100%;
	display: flex;
}

.content {
	flex: 1;
}
</style>
