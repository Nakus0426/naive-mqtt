<script setup lang="tsx">
import { type MessageSchema } from '@/configs/i18n'
import { NFlex, NText, type SelectOption } from 'naive-ui'
import { type RenderLabel } from 'naive-ui/es/_internal/select-menu/src/interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n<{ message: MessageSchema }>()

const options: Array<SelectOption> = [
	{ label: '0', extra: t('common.qos_0'), value: 0 },
	{ label: '1', extra: t('common.qos_1'), value: 1 },
	{ label: '2', extra: t('common.qos_2'), value: 2 },
]

const renderLabel: RenderLabel = ({ label, extra }) => (
	<NFlex justify="space-between" style="width: 100%;">
		<span>{label}</span>
		<NText depth="3">{extra}</NText>
	</NFlex>
)
</script>

<template>
	<NSelect :options v-bind="$attrs" :render-label />
</template>

<style scoped lang="scss"></style>
