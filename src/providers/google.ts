import { fetchProviderText } from '../index.ts'
import type { Suggestions } from '../index.ts'
import { providerParams, type Locale } from '../locale.ts'

type GoogleDefinition = {
	l: {
		il: {
			t: {
				t: string
			}[]
		}
	}[]
}

type GoogleAPI = [
	[[string, number, number[], {
		zi: string
		zs: string
		ansa: GoogleDefinition
	}]],
]

export async function google(q: string, locale?: Locale): Promise<Suggestions> {
	const url = new URL('https://www.google.com/complete/search')
	url.searchParams.set('q', q)
	url.searchParams.set('client', 'gws-wiz')
	for (const [key, value] of Object.entries(providerParams(locale, 'google'))) {
		url.searchParams.set(key, value)
	}

	let text = (await fetchProviderText(url.toString(), locale)) ?? ''

	try {
		text = text.replace('window.google.ac.h(', '')
		text = text.slice(0, text.length - 1)
		const json = JSON.parse(text) as GoogleAPI

		if (json) {
			return json[0].map((item) => {
				const wordDefinition = item[3]?.ansa?.l[1]?.il?.t[0]?.t // bruh

				const text = item[0]
					.replaceAll('<b>', '')
					.replaceAll('</b>', '')
					.replaceAll('&#39;', "'")
				const desc = (wordDefinition ?? item[3]?.zi ?? '').replaceAll('&#39;', "'")
				const image = item[3]?.zs

				return { text, image, desc }
			})
		}
	} catch (_) {
		console.warn('Failed while parsing Google response')
	}

	return []
}
