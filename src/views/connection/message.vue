<script setup lang="ts">
import { highlight } from '@/hooks/useShiki'
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { useContent } from './use-content'
import { DecodeMessageByEnum, Message } from '@/store/modules/connections'
import { format } from 'date-fns'

const {
	placement = 'left',
	color,
	topic,
	timestamp,
	qos,
	content,
} = defineProps<{
	placement?: 'left' | 'right'
	color?: string
	topic?: string
	timestamp?: number
	qos?: number
	content?: Message['message']
}>()
const { t } = useI18n<{ message: MessageSchema }>()
const { decodeMessageBy } = useContent()

const message = computed(async () => {
	if (decodeMessageBy.value === DecodeMessageByEnum.Plaintext) return new TextDecoder().decode(content)
	if (decodeMessageBy.value === DecodeMessageByEnum.JSON) {
		let text = new TextDecoder().decode(content)
		text = JSON.stringify(JSON.parse(text), null, 2)
		return highlight(text)
	}
})
</script>

<template>
	<div class="message" :placement>
		<div class="avatar">
			<Icon icon="tabler:rss" />
		</div>
		<div class="content">
			<div class="content_header">
				<span>{{ topic }}</span>
				<NTag size="tiny">{{ `Qos ${qos}` }}</NTag>
			</div>
			<OverlayScrollbar class="content_body" x="scroll" y="hidden">
				<span v-if="decodeMessageBy === DecodeMessageByEnum.Plaintext">{{ message }}</span>
				<div v-if="decodeMessageBy === DecodeMessageByEnum.JSON" v-html="message" />
			</OverlayScrollbar>
			<div class="content_footer">{{ format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss:SSS') }}</div>
		</div>
		<div class="tools">
			<NTooltip placement="right">
				<template #trigger>
					<NButton size="tiny">
						<template #icon>
							<Icon icon="tabler:clipboard-copy" />
						</template>
					</NButton>
				</template>
				{{ t('common.copy') }}
			</NTooltip>
			<NTooltip placement="right">
				<template #trigger>
					<NButton size="tiny">
						<template #icon>
							<Icon icon="tabler:message-plus" />
						</template>
					</NButton>
				</template>
				{{ t('connection.for_publishing') }}
			</NTooltip>
		</div>
	</div>
</template>

<style scoped lang="scss">
.message {
	display: flex;
	gap: 8px;
	padding-top: 8px;

	&:hover {
		.content_footer {
			opacity: 1;
		}

		.tools {
			opacity: 1;
		}
	}

	&:last-child {
		padding-bottom: 8px;
	}

	&[placement='right'] {
		flex-direction: row-reverse;

		.content {
			&_header {
				justify-content: flex-end;
			}

			&_body {
				margin-left: 0;
				margin-right: 8px;
				border-radius: var(--border-radius) / var(--border-radius) min(var(--border-radius), var(--p) - var(--b) / 2)
					min(var(--border-radius), 100% - var(--p) - var(--b) / 2) var(--border-radius);
				clip-path: polygon(
					100% 100%,
					0 100%,
					0 0,
					100% 0,
					100% max(0%, var(--p) - var(--b) / 2),
					calc(100% + var(--h)) var(--p),
					100% min(100%, var(--p) + var(--b) / 2)
				);
				border-image: conic-gradient(var(--divider-color) 0 0) fill 0 / calc(var(--p) - var(--b) / 2) 0
					calc(100% - var(--p) - var(--b) / 2) var(--border-radius) / 0 var(--h) 0 0;
			}

			&_footer {
				text-align: left;
			}
		}
	}
}

.avatar {
	height: 24px;
	width: 24px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: 1px solid var(--divider-color);
	border-radius: 50%;
	background-color: v-bind('color');
	color: color-contrast(v-bind('color') vs #000, #fff);
}

.content {
	max-width: 70%;
	display: flex;
	flex-direction: column;
	gap: 4px;
	user-select: text;
	overflow: hidden;

	&_header {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	&_body {
		--b: 1em;
		--h: 0.5em;
		--p: 0%;
		margin-left: 8px;
		padding: 8px;
		border-radius: var(--border-radius) / min(var(--border-radius), var(--p) - var(--b) / 2) var(--border-radius)
			var(--border-radius) min(var(--border-radius), 100% - var(--p) - var(--b) / 2);
		clip-path: polygon(
			0 100%,
			100% 100%,
			100% 0,
			0 0,
			0 max(0%, var(--p) - var(--b) / 2),
			calc(-1 * var(--h)) var(--p),
			0 min(100%, var(--p) + var(--b) / 2)
		);
		background: var(--divider-color);
		border-image: conic-gradient(var(--divider-color) 0 0) fill 0 / calc(var(--p) - var(--b) / 2) var(--border-radius)
			calc(100% - var(--p) - var(--b) / 2) 0/ 0 0 0 var(--h);
	}

	&_footer {
		text-align: right;
		font-size: var(--font-size-small);
		color: var(--text-color-3);
		opacity: 0;
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
	}
}

.tools {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 8px;
	opacity: 0;
	transition: all 0.2s var(--cubic-bezier-ease-in-out);
}
</style>
