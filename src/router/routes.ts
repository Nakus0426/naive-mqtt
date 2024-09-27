import { RouteRecordRaw } from 'vue-router'

export const ConnectionRoute: RouteRecordRaw = {
	path: '/connection',
	name: 'Connection',
	component: () => import('@/views/connection/index.vue'),
}

export const ScriptRoute: RouteRecordRaw = {
	path: '/script',
	name: 'Script',
	component: () => import('@/views/script/index.vue'),
}

export const SettingRoute: RouteRecordRaw = {
	path: '/setting',
	name: 'Setting',
	component: () => import('@/views/setting/index.vue'),
}

export const RootRoute: RouteRecordRaw = {
	path: '/',
	name: 'Root',
	redirect: ConnectionRoute,
	children: [ConnectionRoute, ScriptRoute, SettingRoute],
}
