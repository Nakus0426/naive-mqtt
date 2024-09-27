import Store from 'electron-store'
import { NativeTheme } from 'electron'

type AppStore = {
	theme: NativeTheme['themeSource']
}

export const store = new Store<AppStore>()
