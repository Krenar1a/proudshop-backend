from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
import os, json, re, httpx
from bs4 import BeautifulSoup
from app.db.database import get_db
from app.dependencies import get_current_admin
from app.models.admin import AdminSetting

router = APIRouter(prefix="/products/ai", tags=["products-ai"])

OPENAI_KEY_NAME = "OPENAI_API_KEY"

def _get_openai_key(db: Session) -> str | None:
    s = db.query(AdminSetting).filter(AdminSetting.key == OPENAI_KEY_NAME).first()
    return s.value if s and s.value else os.getenv('OPENAI_API_KEY')

class SuggestInput(BaseModel):
    title: str
    features: List[str] = []
    language: str = "sq"
    tone: str | None = None

class SuggestOutput(BaseModel):
    suggested_title: str | None = None
    description: str | None = None
    tags: List[str] = []

@router.post("/suggest", response_model=SuggestOutput)
async def suggest_product_copy(data: SuggestInput, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    api_key = _get_openai_key(db)
    if not api_key:
        raise HTTPException(status_code=400, detail="OpenAI key mungon")
    system = "You are an ecommerce product copy assistant for Albanian (sq) language unless specified. Return concise output."
    user_prompt = (
        f"Generate improved product title, 120-160 word engaging description, and 5-10 short comma-separated SEO tags.\n"
        f"Title: {data.title}\nFeatures: {', '.join(data.features) or 'N/A'}\nLanguage: {data.language}\n"
        f"Tone: {data.tone or 'neutral professional'}\nRespond in JSON with keys: title, description, tags (array)."
    )
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post("https://api.openai.com/v1/chat/completions", headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }, json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 600
            })
        if r.status_code >= 400:
            raise HTTPException(status_code=500, detail=f"OpenAI error {r.status_code}: {r.text[:200]}")
        content = r.json()["choices"][0]["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI request dështoi: {e}")
    json_text = content
    m = re.search(r"```json(.*?)```", content, re.S)
    if m:
        json_text = m.group(1)
    try:
        parsed = json.loads(json_text)
    except Exception:
        parsed = {}
    tags = parsed.get('tags') or []
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(',') if t.strip()]
    return SuggestOutput(suggested_title=parsed.get('title'), description=parsed.get('description'), tags=tags)

class ImageGenIn(BaseModel):
    prompt: str
    size: str = "1024x1024"
    n: int = 1

class ImageGenOut(BaseModel):
    images: List[str]

@router.post('/image', response_model=ImageGenOut)
async def generate_image(data: ImageGenIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    api_key = _get_openai_key(db)
    if not api_key:
        raise HTTPException(status_code=400, detail="OpenAI key mungon")
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            r = await client.post('https://api.openai.com/v1/images/generations', headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }, json={
                'model': 'gpt-image-1',
                'prompt': data.prompt,
                'size': data.size,
                'n': data.n
            })
        if r.status_code >= 400:
            raise HTTPException(status_code=500, detail=f"OpenAI image error {r.status_code}: {r.text[:200]}")
        js = r.json()
        urls = [d.get('url') for d in js.get('data', []) if d.get('url')]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation dështoi: {e}")
    return ImageGenOut(images=urls)

class ScrapeFacebookIn(BaseModel):
    url: str
    price_eur: float | None = None
    category_id: int | None = None

class ScrapeFacebookOut(SuggestOutput):
    product_id: int | None = None
    images: List[str] = []  # image URLs
    videos: List[str] = []  # video URLs

@router.post('/scrape-facebook', response_model=ScrapeFacebookOut)
async def scrape_facebook_post(data: ScrapeFacebookIn, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    # Basic fetch (public page HTML). For private pages requiring auth this will not work.
    try:
        async with httpx.AsyncClient(timeout=30, headers={"User-Agent": "Mozilla/5.0"}) as client:
            r = await client.get(data.url)
        if r.status_code >= 400:
            raise HTTPException(status_code=400, detail=f"Nuk mund të lexoj postin ({r.status_code})")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fetch dështoi: {e}")

    soup = BeautifulSoup(r.text, 'html.parser')
    # Heuristics for extracting text & images
    text_parts = []
    for sel in ['meta[property="og:description"]', 'meta[name="description"]']:
        tag = soup.select_one(sel)
        if tag and tag.get('content'):
            text_parts.append(tag['content'])
    # Fallback: gather paragraphs
    if not text_parts:
        for p in soup.find_all('p'):
            t = (p.get_text() or '').strip()
            if t and len(t) > 20:
                text_parts.append(t)
                if len(text_parts) >= 3:
                    break
    full_text = '\n'.join(dict.fromkeys(text_parts))[:4000]

    images: List[str] = []
    videos: List[str] = []
    for meta_img in soup.select('meta[property="og:image"]'):
        c = meta_img.get('content')
        if c and c not in images:
            images.append(c)
        if len(images) >= 5:
            break
    if not images:
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and 'data:' not in src and src.startswith('http') and src not in images:
                images.append(src)
                if len(images) >= 5:
                    break

    # Collect video URLs (best-effort, public pages only)
    for sel in ['meta[property="og:video"]', 'meta[property="og:video:url"]', 'meta[property="og:video:secure_url"]']:
        tag = soup.select_one(sel)
        if tag and tag.get('content'):
            url = tag['content']
            if url not in videos and url.startswith('http'):
                videos.append(url)
    # <video> tags
    for v in soup.find_all('video'):
        src = v.get('src')
        if src and src.startswith('http') and src not in videos:
            videos.append(src)
        for source in v.find_all('source'):
            s2 = source.get('src')
            if s2 and s2.startswith('http') and s2 not in videos:
                videos.append(s2)
        if len(videos) >= 3:
            break

    # Simple title heuristic
    title_tag = soup.select_one('meta[property="og:title"]') or soup.find('title')
    raw_title = (title_tag.get('content') if title_tag and title_tag.has_attr('content') else title_tag.string) if title_tag else 'Produkt'
    raw_title = (raw_title or 'Produkt').strip()[:120]

    # Create product draft in DB
    from app.models.product import Product
    # Build unified media list for storage (annotate type)
    media_objects = []
    for u in images:
        media_objects.append({"url": u, "type": "image"})
    for v in videos:
        media_objects.append({"url": v, "type": "video"})

    prod = Product(
        title=raw_title,
        description=full_text[:2000] or None,
        price_eur=data.price_eur,
        price_lek=None,
        stock=0,
        category_id=data.category_id,
        images=json.dumps(media_objects) if media_objects else None,
        source_url=data.url
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)

    # Return suggestion format (reuse SuggestOutput) so UI can show & allow refinement
    return ScrapeFacebookOut(product_id=prod.id, suggested_title=prod.title, description=prod.description, tags=[], images=images, videos=videos)
