<script setup lang="tsx">
import { type Connection } from '@/store/modules/connections'
import Side from './side.vue'
import Content from './content.vue'

const contentComponentMap = ref(new Map<Connection['clientId'], typeof Content>())
const currentClientId = ref<Connection['clientId']>()

function handleConnectionSelectUpdate(clientId: Connection['clientId']) {
	currentClientId.value = clientId
	if (!contentComponentMap.value.has(clientId))
		contentComponentMap.value.set(clientId, markRaw(<Content clientId={clientId} />))
}
</script>

<template>
	<div class="connection">
		<Side @select-update="handleConnectionSelectUpdate" />
		<div class="content">
			<TransitionGroup name="next-from-left">
				<component
					v-for="[key, component] in contentComponentMap.entries()"
					:key
					:is="component"
					v-show="key === currentClientId"
				/>
			</TransitionGroup>
		</div>
	</div>
</template>

<style scoped lang="scss">
.connection {
	height: 100%;
	width: 100%;
	display: flex;
}

.content {
	position: relative;
	flex: 1;
	overflow: hidden;
}
</style>
