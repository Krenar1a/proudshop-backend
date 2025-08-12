import { NextRequest, NextResponse } from 'next/server'
import { generateMarketingContent } from '@/lib/openai'

type Product = { id?: string; name?: string; price?: number; description?: string }
type OfferDetails = { discount?: number; expiry?: string; timeLimit?: number; quantity?: number }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const type = String(body?.type || '')
    const data = body?.data || {}

    if (!type) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 })
    }

    if (type === 'product_offer') {
      const product: Product | undefined = data?.productData
      const offer: OfferDetails = data?.offerDetails || {}

      if (!product || !product.name) {
        return NextResponse.json({ error: 'Missing product data' }, { status: 400 })
      }

      const discount = typeof offer.discount === 'number' ? offer.discount : 0
      const timeLimit = typeof offer.timeLimit === 'number' ? offer.timeLimit : undefined
      const price = typeof product.price === 'number' ? product.price : undefined

      // Subject
      const subjectParts = [
        discount ? `Zbritje ${discount}%` : 'Ofertë speciale',
        'për',
        product.name,
      ]
      if (timeLimit) subjectParts.push(`– Vetëm për ${timeLimit} orë!`)
      const subject = subjectParts.filter(Boolean).join(' ')

      // Try to get persuasive copy from OpenAI (optional)
      let aiCopy = ''
      try {
        const ai = await generateMarketingContent(product.name, 'Klientët e dyqanit online', 'email_offer')
        if (ai?.success && ai?.content) aiCopy = ai.content
      } catch {}

      // Simple HTML email content
      const parts: string[] = []
      parts.push(`<h2 style="margin:0 0 12px;">${subject}</h2>`)
      if (product.description) {
        parts.push(`<p style="margin:0 0 12px; color:#374151">${escapeHtml(product.description)}</p>`) 
      }
      if (price !== undefined) {
        const discounted = discount ? (price * (1 - discount / 100)) : price
        parts.push(`<p style="margin:0 0 12px; font-weight:500;">Çmimi: €${toFixedSafe(discounted, 2)}${discount ? ` <span style="color:#6B7280; text-decoration:line-through; font-weight:400;">€${toFixedSafe(price, 2)}</span>` : ''}</p>`)
      }
      if (aiCopy) {
        parts.push(`<div style="margin:12px 0; padding:12px; background:#F9FAFB; border-radius:8px;">${formatAsHtml(aiCopy)}</div>`)
      }
      if (offer.quantity) {
        parts.push(`<p style="margin:0 0 8px; color:#EF4444;">Sasi e kufizuar: ${offer.quantity} copë</p>`)
      }
      if (offer.expiry) {
        parts.push(`<p style="margin:0 0 8px; color:#EF4444;">Oferta vlen deri më: ${escapeHtml(offer.expiry)}</p>`)
      }
      parts.push(`<a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}" style="display:inline-block; margin-top:12px; background:#2563EB; color:white; padding:10px 16px; border-radius:8px; text-decoration:none;">Bli tani</a>`)

      const content = wrapEmail(parts.join(''))
      return NextResponse.json({ email: { subject, content } })
    }

    if (type === 'newsletter') {
      const theme: string = data?.theme || 'weekly'
      const products: Product[] = Array.isArray(data?.products) ? data.products : []
      const themeLabel = theme === 'seasonal' ? 'Koleksioni i Ri' : theme === 'trending' ? 'Produktet Trending' : 'Newsletter Javor'

      const subject = `${themeLabel} – ${new Date().toLocaleDateString('sq-AL')}`

      // Optional AI intro copy
      let aiIntro = ''
      try {
        const ai = await generateMarketingContent('Produkte të përzgjedhura', 'Të gjithë abonentët', 'newsletter')
        if (ai?.success && ai?.content) aiIntro = ai.content
      } catch {}

      const productCards = products.slice(0, 6).map((p) => {
        const price = typeof p.price === 'number' ? toFixedSafe(p.price, 2) : ''
        return `<div style="border:1px solid #E5E7EB; border-radius:10px; padding:12px; margin:8px 0;">
          <div style="font-weight:600; margin-bottom:4px;">${escapeHtml(p?.name || 'Produkt')}</div>
          ${price ? `<div style=\"color:#111827;\">€${price}</div>` : ''}
        </div>`
      }).join('')

      const content = wrapEmail(`
        <h2 style="margin:0 0 12px;">${escapeHtml(themeLabel)}</h2>
        ${aiIntro ? `<div style="margin:12px 0;">${formatAsHtml(aiIntro)}</div>` : ''}
        <div>${productCards || '<p style="color:#6B7280">Së shpejti produkte të reja…</p>'}</div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}" style="display:inline-block; margin-top:12px; background:#2563EB; color:white; padding:10px 16px; border-radius:8px; text-decoration:none;">Shfleto të gjitha</a>
      `)

      return NextResponse.json({ email: { subject, content } })
    }

    return NextResponse.json({ error: 'Unsupported type' }, { status: 400 })
  } catch (err) {
    console.error('AI email generation error:', err)
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}

function toFixedSafe(n: number, d: number) {
  try { return n.toFixed(d) } catch { return String(n) }
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatAsHtml(text: string) {
  // Basic formatting: split paragraphs and line breaks
  const safe = escapeHtml(text)
  return safe
    .split(/\n\n+/)
    .map(p => `<p style="margin:0 0 12px; color:#374151;">${p.replace(/\n/g, '<br/>')}</p>`) 
    .join('')
}

function wrapEmail(innerHtml: string) {
  return `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif; color:#111827; line-height:1.5;">
    ${innerHtml}
    <hr style="border:none; border-top:1px solid #E5E7EB; margin:16px 0;"/>
    <p style="margin:0; color:#6B7280; font-size:12px;">Ky email u dërgua nga ${process.env.NEXT_PUBLIC_SITE_NAME || 'dyqani ynë'}.</p>
  </div>`
}
