import { expect } from '@std/expect'
import { testResponse } from './index.test.ts'
import handler from '../src/index.ts'
import { parseLocale } from '../src/locale.ts'

const providers = ['google', 'bing', 'yahoo', 'duckduckgo', 'qwant', 'brave', 'baidu']

Deno.test('Fallback to auto on bad lang parameter', async () => {
	for (const provider of providers) {
		const res = await handler({
			q: 'minecraft',
			lang: 'zesglljesh',
			with: provider,
		})
		testResponse(res)
	}
})

Deno.test('Correct french in description', async () => {
	const providersWithDesc = ['google'] //, 'bing']

	for (const provider of providersWithDesc) {
		const res = await handler({ q: 'minecraft', lang: 'fr', with: provider })
		const hasAccentAigu = JSON.stringify(res).includes('é')

		expect(hasAccentAigu).toBe(true)
	}
})

Deno.test('Chinese locale aliases resolve to Simplified', () => {
	for (const lang of ['zh', 'zh-CN', 'zh-cn', 'zh-Hans', 'zh_CN', 'zh-Hans-CN', 'zh-SG']) {
		expect(parseLocale(lang)?.tag).toBe('zh-CN')
	}
})

Deno.test('Traditional Chinese stays Traditional', () => {
	for (const lang of ['zh-TW', 'zh-Hant', 'zh-HK', 'zh_MO']) {
		expect(parseLocale(lang)?.tag).toBe('zh-TW')
	}
})

Deno.test('Non-Chinese and empty locales', () => {
	expect(parseLocale('fr')?.tag).toBe('fr')
	expect(parseLocale('')).toBeUndefined()
	expect(parseLocale('zesglljesh')).toBeUndefined()
})

Deno.test('Simplified Chinese suggestions', async () => {
	const chineseProviders = ['google', 'bing', 'duckduckgo', 'baidu']

	for (const provider of chineseProviders) {
		const res = await handler({ q: 'minecraft', lang: 'zh-CN', with: provider })
		testResponse(res)
		expect(/[\u4e00-\u9fff]/.test(JSON.stringify(res))).toBe(true)
	}
})
