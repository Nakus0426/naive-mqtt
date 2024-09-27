import { NPopover, NTooltip } from 'naive-ui'

/**
 * 初始化 Naive UI 默认配置
 */
export function setupNaiveUIDefaultConfig() {
	NPopover.props.showArrow = false
	NTooltip.props.showArrow = false
}
