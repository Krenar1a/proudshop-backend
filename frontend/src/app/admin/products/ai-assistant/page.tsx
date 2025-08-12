"use client"
import { useState, useEffect } from 'react'

export default function ProductAIAssistantPage() {
  const [title, setTitle] = useState('')
  const [features, setFeatures] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [imgPrompt, setImgPrompt] = useState('')
  const [imgLoading, setImgLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  // Scrape form state
  const [fbUrl, setFbUrl] = useState('')
  const [scrapePrice, setScrapePrice] = useState('')
  const [scrapeCategory, setScrapeCategory] = useState('')
  const [scraping, setScraping] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [scrapedProductId, setScrapedProductId] = useState<number | null>(null)

  useEffect(() => {
    // Load categories once for category select
    const loadCats = async () => {
      try {
        const r = await fetch('/api/admin/categories')
        const js = await r.json()
        if (js.categories) setCategories(js.categories)
      } catch (e) { /* ignore */ }
    }
    loadCats()
  }, [])

  const generateCopy = async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch('/api/admin/products/ai/suggest', { method: 'POST', body: JSON.stringify({ title, features: features.split('\n').filter(Boolean) }) })
      const js = await r.json()
      if (!r.ok) throw new Error(js.detail || js.error || 'Dështoi')
      setResult(js)
    } catch (e:any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const generateImages = async () => {
    setImgLoading(true); setError(null)
    try {
      const r = await fetch('/api/admin/products/ai/image', { method: 'POST', body: JSON.stringify({ prompt: imgPrompt }) })
      const js = await r.json()
      if (!r.ok) throw new Error(js.detail || js.error || 'Dështoi')
      setImages(js.images || [])
    } catch (e:any) { setError(e.message) } finally { setImgLoading(false) }
  }

  const scrapeFacebook = async () => {
  setScraping(true); setError(null); setResult(null); setImages([]); setVideos([])
    try {
      const payload: any = { url: fbUrl }
      if (scrapePrice) payload.price_eur = Number(scrapePrice)
      if (scrapeCategory) payload.category_id = Number(scrapeCategory)
      const r = await fetch('/api/admin/products/ai/scrape-facebook', { method: 'POST', body: JSON.stringify(payload) })
      const js = await r.json()
      if (!r.ok) throw new Error(js.detail || js.error || 'Scrape dështoi')
      setScrapedProductId(js.product_id || null)
      setResult(js)
      // Pre-fill title + feature ideas from description lines
      if (js.suggested_title) setTitle(js.suggested_title)
      if (js.description) {
        const lines = js.description.split(/\n+/).map((l:string)=>l.trim()).filter(Boolean).slice(0,6)
        setFeatures(lines.join('\n'))
      }
  if (Array.isArray(js.images)) setImages(js.images)
  if (Array.isArray(js.videos)) setVideos(js.videos)
    } catch (e:any) { setError(e.message) } finally { setScraping(false) }
  }

  return <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold">AI Produkt Asistent</h1>
      <p className="text-gray-600">Gjenero tituj, përshkrime dhe tag-e + imazhe</p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded shadow space-y-4 border">
        <h2 className="font-semibold">Copy / Përshkrimi</h2>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titulli aktual" className="w-full border px-3 py-2 rounded" />
        <textarea value={features} onChange={e=>setFeatures(e.target.value)} placeholder="Tiparet (një për rresht)" className="w-full border px-3 py-2 rounded h-32" />
        <button onClick={generateCopy} disabled={loading || !title} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading? 'Duke gjeneruar...' : 'Gjenero'} </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {result && <div className="space-y-2">
          <h3 className="font-medium">Titull i Sugjeruar</h3>
          <p className="p-2 bg-gray-50 rounded border text-sm">{result.suggested_title}</p>
          <h3 className="font-medium">Përshkrimi</h3>
          <p className="p-2 bg-gray-50 rounded border text-sm whitespace-pre-line">{result.description}</p>
          <h3 className="font-medium">Tags</h3>
          <div className="flex flex-wrap gap-2">{(result.tags||[]).map((t:string)=><span key={t} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{t}</span>)}</div>
        </div>}
      </div>
      <div className="bg-white p-6 rounded shadow space-y-4 border">
        <h2 className="font-semibold">Scrape Facebook Post</h2>
        <input value={fbUrl} onChange={e=>setFbUrl(e.target.value)} placeholder="URL e postimit" className="w-full border px-3 py-2 rounded" />
        <div className="flex gap-2">
          <input value={scrapePrice} onChange={e=>setScrapePrice(e.target.value)} placeholder="Çmimi (EUR)" className="w-1/2 border px-3 py-2 rounded" />
          <select value={scrapeCategory} onChange={e=>setScrapeCategory(e.target.value)} className="w-1/2 border px-3 py-2 rounded">
            <option value="">Kategori</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={scrapeFacebook} disabled={scraping || !fbUrl} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">{scraping? 'Duke lexuar...' : 'Scrape & Krijo Draft'} </button>
        {scrapedProductId && <p className="text-xs text-gray-500">Draft produkt ID: {scrapedProductId}</p>}
        <p className="text-xs text-gray-500">Krijon draft produkt me titull / përshkrim nga Facebook. Më pas mund të rafinosh me AI.</p>
        {videos.length>0 && <div className="space-y-2">
          <h4 className="text-sm font-medium">Video të gjetura</h4>
          <div className="space-y-3 max-h-64 overflow-auto pr-1">
            {videos.map((v,i)=>(
              <div key={i} className="border rounded p-2 bg-gray-50">
                <video src={v} controls className="w-full max-h-40 rounded" />
                <a href={v} target="_blank" className="block text-[10px] text-blue-600 mt-1 break-all">{v}</a>
              </div>
            ))}
          </div>
        </div>}
      </div>
      <div className="bg-white p-6 rounded shadow space-y-4 border">
        <h2 className="font-semibold">Gjenerimi i Imazhit</h2>
        <textarea value={imgPrompt} onChange={e=>setImgPrompt(e.target.value)} placeholder="Prompt" className="w-full border px-3 py-2 rounded h-32" />
        <button onClick={generateImages} disabled={imgLoading || !imgPrompt} className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50">{imgLoading? 'Duke krijuar...' : 'Krijo imazhe'} </button>
        {images.length>0 && <div className="grid grid-cols-2 gap-4">{images.map((src,i)=><div key={i} className="border rounded overflow-hidden"><img src={src} alt="AI" className="w-full h-auto" /></div>)}</div>}
      </div>
    </div>
  </div>
}
