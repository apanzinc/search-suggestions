// Locale utilities
//
// A locale is parsed into its BCP-47 parts instead of being matched against a
// flat alias list. This keeps the language, script and region available to each
// search provider, which need different region codes (google `gl`, bing `mkt`,
// duckduckgo `kl`...).

export type Locale = {
	/** Normalized tag used by providers, e.g. `zh-CN`, `zh-TW`, `fr`. */
	tag: string
	/** Lowercase language subtag, e.g. `zh`. */
	language: string
	/** Uppercase region subtag, e.g. `CN`; absent for language-only locales. */
	region?: string
	/** Title-cased script subtag, e.g. `Hans`, `Hant`. */
	script?: string
}

// Regions that conventionally use Traditional Chinese.
const TRADITIONAL_REGIONS = new Set(['TW', 'HK', 'MO'])

// Regions that conventionally use Simplified Chinese. Anything else under the
// `zh` language falls back to Simplified as well, so `zh`, `zh-Hans`,
// `zh_CN`, `zh-Hans-CN`, `zh-SG` all converge on `zh-CN`.
const SIMPLIFIED_FALLBACK = 'zh-CN'
const TRADITIONAL_FALLBACK = 'zh-TW'

function titleCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/**
 * Parse a locale string into its parts.
 * Returns `undefined` for an empty or unusable input so callers can fall back
 * to provider auto-detection.
 */
export function parseLocale(input: string | undefined | null): Locale | undefined {
	if (!input) return undefined

	const parts = input.trim().replaceAll('_', '-').split('-').filter(Boolean)
	if (parts.length === 0) return undefined

	const language = parts[0].toLowerCase()
	if (!/^[a-z]{2,3}$/.test(language)) return undefined

	let script: string | undefined
	let region: string | undefined

	for (const part of parts.slice(1)) {
		if (/^[a-z]{4}$/i.test(part)) {
			script = titleCase(part)
		} else if (/^[a-z]{2}$/i.test(part) || /^\d{3}$/.test(part)) {
			region = part.toUpperCase()
		}
	}

	// Chinese is the special case: providers care about Simplified vs Traditional,
	// not about the exact script/region combination the client sent.
	if (language === 'zh') {
		const traditional = script === 'Hant' || (region !== undefined && TRADITIONAL_REGIONS.has(region))
		return traditional
			? { tag: TRADITIONAL_FALLBACK, language, region: region ?? 'TW', script: 'Hant' }
			: { tag: SIMPLIFIED_FALLBACK, language, region: region ?? 'CN', script: script ?? 'Hans' }
	}

	const tag = [language, script, region].filter(Boolean).join('-')
	return { tag, language, script, region }
}

/** Build the `Accept-Language` value sent to upstream providers. */
export function acceptLanguage(locale?: Locale): string {
	if (!locale) return 'en-US,en;q=1'
	if (locale.language === 'zh') return `${locale.tag},zh;q=0.9`
	if (locale.region) return `${locale.tag},${locale.language};q=0.9`
	return `${locale.tag};q=0.9`
}

/**
 * Provider-specific query parameters derived from a locale.
 * Each search engine uses its own region format; keeping the mapping here
 * avoids sprinkling `if (lang === 'zh-CN')` branches through every provider.
 */
export function providerParams(locale: Locale | undefined, provider: 'google' | 'bing' | 'duckduckgo'): Record<string, string> {
	if (!locale) return {}

	switch (provider) {
		case 'google': {
			const params: Record<string, string> = { hl: locale.tag }
			// `gl` biases results to a country; only send it when we know one.
			if (locale.region) params.gl = locale.region.toLowerCase()
			return params
		}
		case 'bing': {
			const market = locale.region ? `${locale.language}-${locale.region}` : `${locale.language}-${locale.language}`
			return { mkt: market }
		}
		case 'duckduckgo': {
			// DuckDuckGo uses `<region>-<language>`, e.g. `cn-zh`, `tw-zh`.
			// With no explicit region we pick a sensible default per language.
			const region = locale.region ?? (locale.language === 'zh' ? 'CN' : 'US')
			return { kl: `${region.toLowerCase()}-${locale.language}` }
		}
	}
}
