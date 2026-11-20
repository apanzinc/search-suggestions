import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'
import type { Locale } from '../locale.ts'

type QwantAPI = {
	status: string
	data: {
		items: { value: string }[]
		special: []
	}
}

export async function qwant(q: string, locale?: Locale): Promise<Suggestions> {
	// Qwant has no Simplified Chinese locale; only French is meaningful here.
	const uiLocale = locale?.language === 'fr' ? 'fr' : 'en_US'

	const url = new URL('https://api.qwant.com/v3/suggest')
	url.searchParams.set('q', q)
	url.searchParams.set('locale', uiLocale)
	const json = await fetchProviderJson<QwantAPI>(url.toString(), locale)

	if (json && json.status === 'success') {
		return json.data.items.map((item) => ({
			text: item.value,
		}))
	}

	return []
}
