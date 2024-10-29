<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { Icon } from '@iconify/vue'
import { type FormRules } from 'naive-ui'
import { type Connection, useConnectionsStore } from '@/store/modules/connections'
import { nanoid } from 'nanoid'

const { t } = useI18n<{ message: MessageSchema }>()
const icon = () => <Icon icon="tabler:folder" />
const connectionsStore = useConnectionsStore()

//#region 打开弹窗
const visible = ref(false)
const edit = ref(false)

function open(groupId?: Connection['clientId']) {
	visible.value = true
	if (groupId) {
		edit.value = true
		data.value = toRaw(connectionsStore.connections.find(item => item.id === groupId))
	}
}

function close() {
	edit.value = false
	data.value = structuredClone(defaultData)
}
//#endregion

//#region 表单数据
const rules: FormRules = {
	name: { required: true, message: t('common.input_required', { name: t('connection.new_group_dialog.name') }) },
}
const defaultData: Connection = {
	clientId: null,
	name: null,
	parentClientId: null,
	isGroup: true,
	will: null,
}
const data = ref(structuredClone(defaultData))
//#endregion

//#region 保存
const formRef = useTemplateRef('form')

async function submit() {
	await formRef.value.validate()
	if (edit.value) connectionsStore.updateConnection(data.value)
	else {
		data.value.clientId = nanoid()
		connectionsStore.newConnection(data.value)
	}
}
//#endregion

defineExpose({ open })
</script>

<template>
	<NModal
		v-model:show="visible"
		preset="dialog"
		:icon
		:title="t(`connection.${edit ? 'edit' : 'new'}_group`)"
		:auto-focus="false"
		to=".main"
		:mask-closable="false"
		:positive-text="t('common.save')"
		:negative-text="t('common.cancel')"
		@after-leave="close()"
		@positive-click="submit()"
	>
		<OverlayScrollbar class="new-group-dialog">
			<NForm size="small" label-placement="left" label-width="auto" :rules :model="data" ref="form">
				<NFormItem :label="t('connection.new_group_dialog.name')" path="name">
					<NInput v-model:value.trim="data.name" clearable />
				</NFormItem>
			</NForm>
		</OverlayScrollbar>
	</NModal>
</template>

<style scoped lang="scss">
.new-group-dialog {
	padding: 20px 26px;
}
</style>
