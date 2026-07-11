import { decodeShareLink, sharePreview } from './api/shareMeta'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isSocialBot(userAgent: string) {
  return /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|embedly/i.test(
    userAgent,
  )
}

function botPreviewHtml(opts: {
  title: string
  description: string
  url: string
  image: string
}) {
  const { title, description, url, image } = opts
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Kindred" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`
}

export default function middleware(request: Request) {
  const url = new URL(request.url)
  if (url.pathname !== '/') return

  const r = url.searchParams.get('r')
  const ua = request.headers.get('user-agent') ?? ''
  if (!r || !isSocialBot(ua)) return

  const decoded = decodeShareLink(r)
  if (!decoded) return

  const preview = sharePreview(decoded.clubId, decoded.score)
  if (!preview) return

  const pageUrl = url.toString()
  const imageUrl = `${url.origin}/api/og?r=${encodeURIComponent(r)}`

  return new Response(
    botPreviewHtml({
      title: escapeHtml(preview.title),
      description: escapeHtml(preview.description),
      url: escapeHtml(pageUrl),
      image: escapeHtml(imageUrl),
    }),
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

export const config = {
  matcher: ['/'],
}
