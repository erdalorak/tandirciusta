/**
 * 301 Yönlendirme modülü — URL doğrulama ve normalizasyon yardımcıları.
 * Yalnızca tandirciusta.com domaini kabul edilir.
 */

/** İzin verilen host adları (www dahil) */
export const ALLOWED_HOSTS = new Set(['tandirciusta.com', 'www.tandirciusta.com'])

/** Domain dışı URL girildiğinde gösterilecek sabit uyarı metni */
export const DOMAIN_ERROR_MESSAGE =
  "Bu işlem yalnızca 'tandirciusta.com' domaini için yapılabilir. Lütfen yanlışlıkla farklı bir siteye ait URL girmediğinizden emin olun."

export type UrlRedirect = {
  id: string
  source_path: string
  destination_path: string
  status_code: number
  created_at: string
}

type ParseSuccess = { ok: true; path: string }
type ParseFailure = { ok: false; error: string }
export type ParseResult = ParseSuccess | ParseFailure

/**
 * Kullanıcı girdisini site içi path'e çevirir.
 * Tam URL veya / ile başlayan yol kabul edilir.
 */
export function parseAndValidateSiteUrl(input: string): ParseResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'URL boş olamaz.' }
  }

  let pathname: string

  if (trimmed.startsWith('/')) {
    pathname = trimmed
  } else {
    try {
      const url = new URL(trimmed)
      const host = url.hostname.toLowerCase()
      if (!ALLOWED_HOSTS.has(host)) {
        return { ok: false, error: DOMAIN_ERROR_MESSAGE }
      }
      pathname = url.pathname + url.search + url.hash
    } catch {
      return {
        ok: false,
        error:
          'Geçerli bir URL veya yol girin (örn. /blog/eski-sayfa veya https://tandirciusta.com/blog/eski-sayfa).',
      }
    }
  }

  return { ok: true, path: normalizePath(pathname) }
}

/** Path'i karşılaştırma için standart forma getirir */
export function normalizePath(path: string): string {
  let normalized = decodeURIComponent(path.trim())
  if (!normalized.startsWith('/')) normalized = `/${normalized}`
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

/** Eski ve yeni URL çiftini doğrular; hata varsa mesaj döner */
export function validateRedirectPair(
  sourceInput: string,
  destinationInput: string,
): { source: string; destination: string } | { error: string } {
  const sourceResult = parseAndValidateSiteUrl(sourceInput)
  if (!sourceResult.ok) return { error: `Eski URL: ${sourceResult.error}` }

  const destResult = parseAndValidateSiteUrl(destinationInput)
  if (!destResult.ok) return { error: `Yeni URL: ${destResult.error}` }

  if (sourceResult.path === destResult.path) {
    return { error: 'Eski URL ve Yeni URL aynı olamaz.' }
  }

  // Admin paneli ve API yollarına yönlendirme engeli
  const blockedPrefixes = ['/tusta', '/api']
  if (blockedPrefixes.some((p) => sourceResult.path === p || sourceResult.path.startsWith(`${p}/`))) {
    return { error: 'Bu kaynak yola yönlendirme eklenemez.' }
  }

  return { source: sourceResult.path, destination: destResult.path }
}
