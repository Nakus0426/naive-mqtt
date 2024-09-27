<script setup lang="ts">
// 将API挂载到全局
window.$loadingBar = useLoadingBar()
window.$message = useMessage()
window.$notification = useNotification()
window.$dialog = useDialog()
window.$modal = useModal()
</script>

<template>
	<slot />
</template>

<style scoped lang="scss"></style>
