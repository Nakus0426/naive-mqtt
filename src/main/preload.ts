import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	updateTheme: (...args) => ipcRenderer.send('update-theme', ...args),
})
