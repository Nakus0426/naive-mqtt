import { type HighlighterCore, createHighlighterCore } from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'

let highlighter: HighlighterCore

if (!highlighter)
	highlighter = await createHighlighterCore({
		themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
		langs: [import('@shikijs/langs/json')],
		engine: createOnigurumaEngine(import('shiki/wasm')),
	})

export function highlight(code: string) {
	return highlighter.codeToHtml(code, {
		lang: 'json',
		themes: { light: 'github-light', dark: 'github-dark' },
		transformers: [transformerColorizedBrackets()],
	})
}
