export type Response = { success: boolean; message?: string }

export function response(success: boolean, message?: string) {
	return { success, message }
}

export function arrayToTree<T = any>(
	data: Array<T>,
	options?: { idField?: string; parentField?: string; childrenField?: string; callback?: (item: T) => any },
) {
	const { idField = 'id', parentField = 'parentId', childrenField = 'children', callback } = options || {}
	let result = []
	if (!Array.isArray(data) || data.length === 0) return result
	const map = new Map()
	data.forEach(item => {
		item = callback ? callback(item) : item
		map.set(item[idField], item)
	})
	data.forEach(item => {
		const parent = map.get(item[parentField])
		if (parent) (parent[childrenField] || (parent[childrenField] = [])).push(item)
		else result.push(item)
	})
	return result
}
