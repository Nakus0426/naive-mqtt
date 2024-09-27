import { type IconifyJSON, addCollection } from '@iconify/vue'
import tabler from '@iconify/json/json/tabler.json'
import materialSymbols from '@iconify/json/json/material-symbols.json'

const collection = [tabler, materialSymbols] as IconifyJSON[]

/**
 * 初始化图标库
 */
export function setupIconify() {
	collection.forEach(item => addCollection(item))
}
