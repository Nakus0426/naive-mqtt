export type Response = { success: boolean; message?: string }

export function response(success: boolean, message?: string) {
	return { success, message }
}
