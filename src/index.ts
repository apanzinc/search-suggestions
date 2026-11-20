import { duckduckgo } from './providers/duckduckgo.ts'
import { google } from './providers/google.ts'
import { brave } from './providers/brave.ts'
import { qwant } from './providers/qwant.ts'
import { yahoo } from './providers/yahoo.ts'
import { bing } from './providers/bing.ts'
import { baidu } from './providers/baidu.ts'
import { acceptLanguage, parseLocale, type Locale } from './locale.ts'

export type Suggestions = {
	text: string
	desc?: string
	image?: string
}[]

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/114.0'

export default async function handler(args = { q: '', with: '', lang: '' }): Promise<Suggestions> {
	const { q } = args

	if (!q) {
		return []
	}

	const locale = parseLocale(args.lang)

	switch (args.with) {
		case 'ddg':
		case 'duckduckgo':
			return await duckduckgo(q, locale)
		case 'google':
			return await google(q, locale)
		case 'bing':
			return await bing(q, locale)
		case 'baidu':
			return await baidu(q)
		case 'brave':
			return await brave(q)
		case 'qwant':
			return await qwant(q, locale)
		case 'yahoo':
			return await yahoo(q)
		default:
			return []
	}
}

//
//	Helpers
//

export function requestHeaders(locale?: Locale): Record<string, string> {
	return {
		'Accept-Language': acceptLanguage(locale),
		'User-Agent': USER_AGENT,
	}
}

export async function fetchProviderJson<T>(url: string, locale?: Locale): Promise<T | undefined> {
	try {
		const response = await fetch(url, { headers: requestHeaders(locale) })
		try {
			return await response.json() as T
		} catch (_) {
			console.warn(`Cannot parse ${url} as JSON`)
		}
	} catch (_) {
		console.warn(`Cannot reach ${url}`)
	}
}

export async function fetchProviderText(url: string, locale?: Locale): Promise<string | undefined> {
	try {
		const response = await fetch(url, { headers: requestHeaders(locale) })
		try {
			return await response.text()
		} catch (_) {
			console.warn(`Cannot get ${url} as text`)
		}
	} catch (_) {
		console.warn(`Cannot reach ${url}`)
	}
}
