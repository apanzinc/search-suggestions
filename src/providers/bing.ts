import { fetchProviderJson } from '../index.ts'
import type { Suggestions } from '../index.ts'
import { providerParams, type Locale } from '../locale.ts'

type Bing = {
	s: {
		q: string
		u: string
		ext?: {
			des: string
			im: string
			t: string
		}
	}[]
}

export async function bing(q: string, locale?: Locale): Promise<Suggestions> {
	const url = new URL('https://www.bing.com/AS/Suggestions')
	url.searchParams.set('qry', q)
	url.searchParams.set('cp', '5')
	url.searchParams.set('csr', '1')
	url.searchParams.set('msbqf', 'false')
	url.searchParams.set('cvid', '7AE3B40123C74FFF87EF8A5ED4FAF455')
	for (const [key, value] of Object.entries(providerParams(locale, 'bing'))) {
		url.searchParams.set(key, value)
	}

	const json = await fetchProviderJson<Bing>(url.toString(), locale)
	const result: Suggestions = []

	if (!json) {
		return []
	}

	for (const item of Object.values(json.s)) {
		result.push({
			text: item.q.replace('\ue000', '').replace('\ue001', ''),
			desc: item.ext ? item.ext?.des : undefined,
			image: item.ext ? 'https://th.bing.com' + item.ext?.im : undefined,
		})
	}

	return result
}
