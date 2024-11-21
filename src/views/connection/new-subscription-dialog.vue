<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { Icon } from '@iconify/vue'
import { type FormRules } from 'naive-ui'
import { Connection, useConnectionsStore, type Subscription } from '@/store/modules/connections.js'
import { nanoid } from 'nanoid'
import { randomInt } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { format } from 'date-fns'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionsStore = useConnectionsStore()

//#region 打开弹窗
const visible = ref(false)
const isEdit = ref(false)

function open(clientId: Connection['clientId']) {
	data.value.clientId = clientId
	visible.value = true
}

async function edit(clientId: Connection['clientId'], id: Subscription['id']) {
	isEdit.value = true
	const subscription = await connectionsStore.getSubscription(clientId, id)
	data.value = structuredClone(subscription)
	visible.value = true
}

function close() {
	isEdit.value = false
	defaultData.color = generateColor()
	data.value = structuredClone(defaultData)
}
//#endregion

//#region 数据
const topicFormLabel = computed(() => t(`connection.new_subscription_dialog.topic`))
const rules = computed<FormRules>(() => ({
	topic: { required: true, message: t('common.input_required', { name: topicFormLabel.value }) },
}))
const defaultData: Subscription = {
	id: nanoid(),
	clientId: '',
	name: '',
	color: generateColor(),
	topic: '',
	qos: 0,
	nl: false,
	rap: false,
	rh: 0,
	children: [],
	isGroup: false,
}
const data = ref<Subscription>(structuredClone(defaultData))

function generateColor() {
	return `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`
}
//#endregion

//#region 保存
const formRef = useTemplateRef('form')
const submitLoading = ref(false)

async function submit() {
	try {
		submitLoading.value = true
		await formRef.value.validate()
		if (isEmpty(data.value.name)) data.value.name = format(new Date(), 'yyyyMMddHHmmss')
		isEdit.value
			? await connectionsStore.updateSubscription(data.value)
			: await connectionsStore.newSubscription(data.value)
		visible.value = false
	} finally {
		submitLoading.value = false
	}
}
//#endregion

defineExpose({ open, edit })
</script>

<template>
	<NModal
		v-model:show="visible"
		preset="dialog"
		:icon="() => h(Icon, { icon: 'tabler:rss' })"
		:title="t(`connection.${isEdit ? 'edit' : 'new'}_subscription`)"
		to=".main"
		:auto-focus="false"
		:mask-closable="false"
		:close-on-esc="false"
		:positive-text="t('common.save')"
		:negative-text="t('common.cancel')"
		@after-leave="close()"
		@positive-click="submit()"
	>
		<OverlayScrollbar class="new-subscription-dialog">
			<NForm size="small" label-width="auto" label-placement="top" :rules :model="data" ref="form">
				<NGrid :cols="2" x-gap="24">
					<NFormItemGridItem>
						<template #label>
							<NFlex align="center" :size="4">
								<span>{{ t('connection.new_subscription_dialog.name') }}</span>
								<HelpTooltip :content="t('connection.new_subscription_dialog.name_help')" />
							</NFlex>
						</template>
						<NInput v-model:value="data.name" clearable />
					</NFormItemGridItem>
					<NFormItemGridItem :label="t('connection.new_subscription_dialog.color')">
						<NFlex style="width: 100%" align="center" :size="4" :wrap="false">
							<NColorPicker v-model:value="data.color" :modes="['rgb']" :show-alpha="false" />
							<NButton size="small" @click="data.color = generateColor()">{{ t('common.generate') }}</NButton>
						</NFlex>
					</NFormItemGridItem>
					<NFormItemGridItem path="topic" :span="2">
						<template #label>
							<NFlex align="center" :size="4">
								<span>{{ topicFormLabel }}</span>
								<HelpTooltip :content="t('connection.new_subscription_dialog.topic_help')" />
							</NFlex>
						</template>
						<NInput v-model:value="data.topic" type="textarea" />
					</NFormItemGridItem>
					<NFormItemGridItem :label="t('connection.new_subscription_dialog.qos')">
						<QosSelect v-model:value="data.qos" />
					</NFormItemGridItem>
					<NFormItemGridItem :label="t('connection.new_subscription_dialog.no_local_flag')">
						<NSwitch v-model:value="data.nl" />
					</NFormItemGridItem>
					<NFormItemGridItem :label="t('connection.new_subscription_dialog.retain_as_published_flag')">
						<NSwitch v-model:value="data.rap" />
					</NFormItemGridItem>
					<NFormItemGridItem :label="t('connection.new_subscription_dialog.retain_handling')">
						<NSelect
							v-model:value="data.rh"
							:options="[
								{ label: '0', value: 0 },
								{ label: '1', value: 1 },
								{ label: '2', value: 2 },
							]"
						/>
					</NFormItemGridItem>
				</NGrid>
			</NForm>
		</OverlayScrollbar>
	</NModal>
</template>

<style scoped lang="scss">
.new-subscription-dialog {
	width: 70vw;
	height: 60vh;
	padding: 20px 26px 0 26px;
}
</style>
