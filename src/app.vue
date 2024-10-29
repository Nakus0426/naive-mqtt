<script setup lang="ts">
import Main from './layouts/main.vue'
import { useConnectionsStore } from '@/store/modules/connections'

useConnectionsStore().init()
</script>

<template>
	<ConfigProvider>
		<Main></Main>
	</ConfigProvider>
</template>

<style scoped lang="scss"></style>
