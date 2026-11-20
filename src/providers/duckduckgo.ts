import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'
import { providerParams, type Locale } from '../locale.ts'

type DuckduckgoAPI = {
	phrase: string
}[]

export async function duckduckgo(q: string, locale?: Locale): Promise<Suggestions> {
	const url = new URL('https://duckduckgo.com/ac/')
	url.searchParams.set('q', q)
	for (const [key, value] of Object.entries(providerParams(locale, 'duckduckgo'))) {
		url.searchParams.set(key, value)
	}

	const json = await fetchProviderJson<DuckduckgoAPI>(url.toString(), locale)

	if (json) {
		return Object.values(json).map((item) => ({ text: item.phrase }))
	}

	return []
}
