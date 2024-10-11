import Store from 'electron-store'
import { type NativeTheme } from 'electron'
import { type CreateClientOptions } from './mqtt.ts'

type AppStore = {
	theme: NativeTheme['themeSource']
	clients: Record<string, CreateClientOptions>
}

export const store = new Store<AppStore>()
