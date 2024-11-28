<script setup lang="tsx">
import { type Connection } from '@/store/modules/connections'
import Side from './side.vue'
import Content from './content.vue'
import { render } from 'vue'
import { useConnection, useProvideConnection } from './use-connection'
import NewConnectionDialog from './new-connection-dialog.vue'

useProvideConnection()
const { selectedClientId, connectionDeleteEventHook, connectionSelectedUpdateEventHook } = useConnection()

//#region 连接选中状态
const contentComponentMap = ref(new Map<Connection['clientId'], typeof Content>())
const contentRef = useTemplateRef('content')
connectionSelectedUpdateEventHook.on(clientId => {
	selectedClientId.value = clientId
	if (!contentComponentMap.value.has(clientId))
		contentComponentMap.value.set(clientId, markRaw(<Content clientId={clientId} />))
})

connectionDeleteEventHook.on(clientId => {
	selectedClientId.value = null
	contentComponentMap.value.delete(clientId)
	render(null, contentRef.value)
})
//#endregion
</script>

<template>
	<div class="connection">
		<Side />
		<div class="content" ref="content">
			<TransitionGroup name="next-from-left">
				<component
					v-for="[key, component] in contentComponentMap.entries()"
					:key
					:is="component"
					v-show="key === selectedClientId"
				/>
				<Icon
					height="64"
					width="64"
					icon="custom:logo-plain"
					color="var(--tag-color)"
					key="logo"
					v-if="!selectedClientId"
				/>
			</TransitionGroup>
		</div>
		<NewConnectionDialog />
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

	&:has(.iconify) {
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>
