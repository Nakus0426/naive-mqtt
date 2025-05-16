<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import { type NativeTheme } from 'electron'
import ThemeSystemImage from '@/assets/images/theme_system.svg'
import ThemeLightImage from '@/assets/images/theme_light.svg'
import ThemeDarkImage from '@/assets/images/theme_dark.svg'
import { useI18n } from 'vue-i18n'
import { type MessageSchema } from '@/configs/i18n'
import { SelectBaseOption } from 'naive-ui/es/select/src/interface'
import { useService } from 'electron-bridge-ipc/electron-sandbox'
import { type IMainService, ChannelNameEnum } from '@/main/services/interface'

const { t, locale, messages } = useI18n<{ message: MessageSchema }>()
const appStore = useAppStore()
const mainService = useService<IMainService>(ChannelNameEnum.Main)

const [DefineCell, Cell] = createReusableTemplate<{ title: string }>({ inheritAttrs: false })
const [DefineCellItem, CellItem] = createReusableTemplate<{ label: string }>()

//#region 主题
const [DefineThemeRadio, ThemeRadio] = createReusableTemplate<{ theme: NativeTheme['themeSource']; title: string }>({
	inheritAttrs: false,
})
const themeRadioImageMap = { system: ThemeSystemImage, light: ThemeLightImage, dark: ThemeDarkImage }

function handleThemeUpdate(theme: NativeTheme['themeSource']) {
	mainService.updateTheme(theme)
	appStore.theme = theme
}
//#endregion

//#region 语言
const locales: Array<SelectBaseOption> = Object.entries(messages.value).map(([key, value]) => ({
	label: value.language,
	value: key,
}))

function handleLocaleUpdate(value: string) {
	appStore.locale = value
}
//#endregion
</script>

<template>
	<OverlayScrollbar class="setting">
		<DefineCell v-slot="{ title, $slots }">
			<div class="cell">
				<div class="cell_header">{{ title }}</div>
				<div class="cell_body">
					<component :is="$slots.default" />
				</div>
			</div>
		</DefineCell>

		<DefineCellItem v-slot="{ label, $slots }">
			<div class="cell_item">
				<div class="cell_item_label">{{ label }}</div>
				<div class="cell_item_value">
					<component :is="$slots.default" />
				</div>
			</div>
		</DefineCellItem>

		<DefineThemeRadio v-slot="{ theme, title }">
			<div class="theme-radio_item" :selected="appStore.theme === theme" @click="handleThemeUpdate(theme)">
				<img draggable="false" :src="themeRadioImageMap[theme]" />
				<Icon height="20" width="20" color="var(--primary-color)" icon="material-symbols:check-circle-rounded" />
				<span>{{ title }}</span>
			</div>
		</DefineThemeRadio>

		<div class="header">
			<Icon height="1em" width="1em" color="var(--primary-color)" icon="tabler:settings" />
			<span>{{ t('main.menu.setting') }}</span>
		</div>
		<Cell :title="t('setting.appearance.title')">
			<CellItem :label="t('setting.appearance.theme.title')">
				<div class="theme-radio">
					<ThemeRadio theme="system" :title="t('setting.appearance.theme.system')" />
					<ThemeRadio theme="light" :title="t('setting.appearance.theme.light')" />
					<ThemeRadio theme="dark" :title="t('setting.appearance.theme.dark')" />
				</div>
			</CellItem>
			<CellItem :label="t('setting.appearance.primary_color.title')">
				<NFlex align="center">
					<NCheckbox v-model:checked="appStore.isPrimaryColorFollowSystem">
						{{ t('setting.appearance.primary_color.follow_system') }}
					</NCheckbox>
					<NColorPicker
						style="width: 200px"
						size="small"
						:modes="['hex']"
						:show-alpha="false"
						v-model:value="appStore.primaryColor"
					>
						<template #action>
							<NButton size="tiny" @click="appStore.primaryColorRestoreDefaults()">
								{{ t('common.restore_defaults') }}
							</NButton>
							<NButton size="tiny" @click="appStore.primaryColorFollowSystem()">
								{{ t('setting.appearance.primary_color.title') }}
							</NButton>
						</template>
					</NColorPicker>
				</NFlex>
			</CellItem>
			<CellItem :label="t('setting.appearance.language.title')">
				<NSelect
					style="width: 200px"
					size="small"
					v-model:value="locale"
					:options="locales"
					@update:value="handleLocaleUpdate"
				/>
			</CellItem>
		</Cell>
	</OverlayScrollbar>
</template>

<style scoped lang="scss">
.setting {
	height: 100%;
	width: 100%;
	background-color: var(--card-color);
	border-radius: var(--border-radius);
	border: 1px solid var(--border-color);
}

.header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 16px 16px 0px 16px;
	font-size: 20px;
	font-weight: bold;
}

.cell {
	&_header {
		position: sticky;
		top: -1px;
		font-size: var(--font-size-large);
		font-weight: bold;
		padding: 8px 16px;
		border-bottom: 1px solid var(--border-color);
		background-color: var(--card-color);
	}

	&_body {
		padding: 0px 16px 16px 16px;
	}

	&_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0px;
		border-bottom: 1px solid var(--divider-color);

		&_label {
			color: var(--text-color-3);
		}
	}
}

.theme-radio {
	display: flex;
	gap: 8px;

	&_item {
		position: relative;
		width: 128px;
		height: 80px;
		cursor: pointer;
		border: 2px solid transparent;
		border-radius: var(--border-radius);
		transition: all 0.2s var(--cubic-bezier-ease-in-out);
		overflow: hidden;

		&:hover {
			border-color: var(--primary-color);
		}

		&[selected='true'] {
			border-color: var(--primary-color);

			svg {
				display: block;
			}
		}

		img {
			height: 100%;
			width: 100%;
			object-fit: cover;
		}

		svg {
			position: absolute;
			right: 4px;
			bottom: 4px;
			display: none;
		}

		span {
			position: absolute;
			top: -1px;
			left: -1px;
			padding: 0 4px;
			font-size: var(--font-size-small);
			border-bottom-right-radius: var(--border-radius);
			border-top-left-radius: var(--border-radius);
			background-color: var(--primary-color);
			color: color-contrast(var(--primary-color) vs #000, #fff);
			transition: all 0.2s var(--cubic-bezier-ease-in-out);
		}
	}
}
</style>
