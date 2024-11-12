import Store from 'electron-store'
import { type NativeTheme } from 'electron'

type AppStore = {
	theme: NativeTheme['themeSource']
}

export const store = new Store<AppStore>()
