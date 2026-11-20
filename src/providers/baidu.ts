import { fetchProviderText } from '../index.ts'
import type { Suggestions } from '../index.ts'

type BaiduSugrec = {
	g?: {
		q?: string
		type?: string
	}[]
}

export async function baidu(q: string): Promise<Suggestions> {
	const url = new URL('https://www.baidu.com/sugrec')
	url.searchParams.set('prod', 'pc')
	url.searchParams.set('wd', q)

	const text = await fetchProviderText(url.toString())
	if (!text) return []

	let json: BaiduSugrec
	try {
		json = JSON.parse(text) as BaiduSugrec
	} catch (_) {
		console.warn('Failed while parsing Baidu response')
		return []
	}

	const seen = new Set<string>()
	const result: Suggestions = []

	for (const item of json.g ?? []) {
		const value = item.q?.trim()
		if (!value || seen.has(value)) continue
		seen.add(value)
		result.push({ text: value })
	}

	return result
}
