<script setup lang="tsx">
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { Icon } from '@iconify/vue'
import { type FormRules } from 'naive-ui'
import { useConnectionsStore, type Subscription } from '@/store/modules/connections.js'
import { nanoid } from 'nanoid'

const { t } = useI18n<{ message: MessageSchema }>()
const connectionsStore = useConnectionsStore()

//#region 打开弹窗
const visible = ref(false)
const edit = ref(false)

function open(id?: Subscription['id']) {
	visible.value = true
	edit.value = !!id
	if (edit.value) data.value = structuredClone(connectionsStore.getSubscription(id))
}

function close() {
	edit.value = false
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
	name: '',
	color: generateColor(),
	topic: '',
	qos: 0,
	nl: false,
	rap: false,
	rh: 0,
}
const data = ref<Subscription>(structuredClone(defaultData))

function generateColor() {
	const letters = '0123456789ABCDEF'
	let color = '#'
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}
//#endregion

//#region 保存
const formRef = useTemplateRef('form')
const submitLoading = ref(false)

async function submit() {
	try {
		submitLoading.value = true

		await formRef.value.validate()
		edit.value
			? await connectionsStore.updateSubscription(data.value)
			: await connectionsStore.newSubscription(data.value)
		visible.value = false
	} finally {
		submitLoading.value = false
	}
}
//#endregion

defineExpose({ open })
</script>

<template>
	<NModal
		v-model:show="visible"
		preset="dialog"
		:icon="() => h(Icon, { icon: 'tabler:rss' })"
		:title="t(`connection.${edit ? 'edit' : 'new'}_subscription`)"
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
							<NColorPicker v-model:value="data.color" :modes="['hex']" :show-alpha="false" />
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
