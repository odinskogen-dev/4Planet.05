from pathlib import Path

def replace_exact(path, old, new, expected=1):
    p=Path(path); s=p.read_text()
    n=s.count(old)
    if n != expected:
        raise SystemExit(f'{path}: expected {expected} matches, found {n}: {old[:100]}')
    p.write_text(s.replace(old,new))

# 1) Preserve crawler-readable raw HTML without painting a duplicate pre-hydration page.
replace_exact('scripts/prerender-magazine-seo.mjs',
'''  const html = staticMarkup ? withHead.replace('<div id="root"></div>', `<div id="root">${staticMarkup}</div>`) : withHead;''',
'''  const html = staticMarkup ? withHead.replace('<div id="root"></div>', `<div id="root"></div><noscript>${staticMarkup}</noscript>`) : withHead;''')

# 2) Remove Google Fonts stylesheet from the critical render path; keep a no-JS fallback and preconnect film art.
p=Path('index.html'); s=p.read_text()
font='''    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Sans:wght@400;500;600&family=Fragment+Mono:ital@0;1&display=swap" rel="stylesheet" />'''
async_font='''    <link rel="preconnect" href="https://i.ytimg.com" crossorigin />\n    <link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Sans:wght@400;500;600&family=Fragment+Mono:ital@0;1&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'" />\n    <noscript><link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Sans:wght@400;500;600&family=Fragment+Mono:ital@0;1&display=swap" rel="stylesheet" /></noscript>'''
if s.count(font)!=1: raise SystemExit('index.html font stylesheet target drift')
p.write_text(s.replace(font,async_font))

# 3) Activate the already-existing lighter Magazine hero asset for mobile.
replace_exact('src/content/imageRegistry.ts',
'''  m4gazineHero: { src: `${A}/missions/m4gazine/hero.jpg`, alt: "An open editorial spread — print in detail", mission: "m4gazine", domain: "4CULTURE_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },''',
'''  m4gazineHero: { src: `${A}/missions/m4gazine/hero.jpg`, srcMobile: `${A}/missions/m4gazine/hero-mobile.jpg`, alt: "An open editorial spread — print in detail", mission: "m4gazine", domain: "4CULTURE_", aspectRatio: "3/2", objectPosition: "50% 50%", role: "missionHero" },''')

# 4) Magazine: prioritize only the true hero; serve mobile variants and deprioritize below-fold art.
replace_exact('src/pages/v5/Magazine.tsx',
'''<img src={media.src} alt={media.alt} loading={index < 3 ? "eager" : "lazy"} decoding="async" onError={safeImageFallback} />''',
'''<img src={media.src} srcSet={media.srcMobile ? `${media.srcMobile} 720w, ${media.src} 1600w` : undefined} sizes="(max-width: 640px) 96vw, 50vw" alt={media.alt} loading="lazy" decoding="async" fetchPriority="low" onError={safeImageFallback} />''')
replace_exact('src/pages/v5/Magazine.tsx',
'''<img className="mag-signal-card-media" src={media.src} alt={media.alt} loading="lazy" decoding="async" onError={safeImageFallback} />''',
'''<img className="mag-signal-card-media" src={media.src} srcSet={media.srcMobile ? `${media.srcMobile} 720w, ${media.src} 1600w` : undefined} sizes="(max-width: 640px) 96vw, 50vw" alt={media.alt} loading="lazy" decoding="async" fetchPriority="low" onError={safeImageFallback} />''')
replace_exact('src/pages/v5/Magazine.tsx',
'''<img src={media.src} alt={copy === 1 ? "" : media.alt} loading="lazy" decoding="async" onError={safeImageFallback} />''',
'''<img src={media.src} srcSet={media.srcMobile ? `${media.srcMobile} 720w, ${media.src} 1600w` : undefined} sizes="(max-width: 640px) 72vw, 24vw" alt={copy === 1 ? "" : media.alt} loading="lazy" decoding="async" fetchPriority="low" onError={safeImageFallback} />''')
replace_exact('src/pages/v5/Magazine.tsx',
'''<img src={film.imageUrl} alt={copy === 1 ? "" : film.imageAlt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={(event) => filmImageFallback(event, film.fallbackImageUrl)} />''',
'''<img src={film.fallbackImageUrl || film.imageUrl} alt={copy === 1 ? "" : film.imageAlt} loading="lazy" decoding="async" fetchPriority="low" referrerPolicy="no-referrer" onError={(event) => filmImageFallback(event, film.imageUrl)} />''')
replace_exact('src/pages/v5/Magazine.tsx',
'''<figure className="mag-home-hero-visual"><img src={hero.src} alt={hero.alt} loading="eager" decoding="async" onError={safeImageFallback} /><figcaption>4CULTURE_ / EDITORIAL SYSTEM</figcaption></figure>''',
'''<figure className="mag-home-hero-visual"><img src={hero.src} srcSet={hero.srcMobile ? `${hero.srcMobile} 720w, ${hero.src} 1600w` : undefined} sizes="(max-width: 640px) 96vw, 42vw" alt={hero.alt} width="1200" height="800" loading="eager" decoding="async" fetchPriority="high" onError={safeImageFallback} /><figcaption>4CULTURE_ / EDITORIAL SYSTEM</figcaption></figure>''')
replace_exact('src/pages/v5/Magazine.tsx',
'''<figure className="mag-franchise-visual"><img src={recurringVisual.src} alt={recurringVisual.alt} loading="lazy" decoding="async" onError={safeImageFallback} />''',
'''<figure className="mag-franchise-visual"><img src={recurringVisual.src} srcSet={recurringVisual.srcMobile ? `${recurringVisual.srcMobile} 720w, ${recurringVisual.src} 1600w` : undefined} sizes="(max-width: 640px) 96vw, 80vw" alt={recurringVisual.alt} loading="lazy" decoding="async" fetchPriority="low" onError={safeImageFallback} />''')

# 5) Films: use 480px official trailer fallbacks for catalog/rails; preserve max-res for featured and detail art.
p=Path('src/pages/v5/MagazineFilms.tsx'); s=p.read_text()
old='''function FilmImage({ film, eager = false, decorative = false }: { film: FilmRecord; eager?: boolean; decorative?: boolean }) {\n  const [src, setSrc] = useState(film.imageUrl);\n  const [failed, setFailed] = useState(false);\n\n  useEffect(() => {\n    setSrc(film.imageUrl);\n    setFailed(false);\n  }, [film.imageUrl]);'''
new='''function FilmImage({ film, eager = false, decorative = false, compact = false }: { film: FilmRecord; eager?: boolean; decorative?: boolean; compact?: boolean }) {\n  const initialSrc = compact && film.fallbackImageUrl ? film.fallbackImageUrl : film.imageUrl;\n  const [src, setSrc] = useState(initialSrc);\n  const [failed, setFailed] = useState(false);\n\n  useEffect(() => {\n    setSrc(compact && film.fallbackImageUrl ? film.fallbackImageUrl : film.imageUrl);\n    setFailed(false);\n  }, [film.imageUrl, film.fallbackImageUrl, compact]);'''
if s.count(old)!=1: raise SystemExit('FilmImage signature target drift')
s=s.replace(old,new)
old_err='''      onError={() => {\n        if (film.fallbackImageUrl && src !== film.fallbackImageUrl) setSrc(film.fallbackImageUrl);\n        else setFailed(true);\n      }}'''
new_err='''      fetchPriority={eager ? "high" : "low"}\n      onError={() => {\n        if (src !== film.imageUrl && film.imageUrl) setSrc(film.imageUrl);\n        else if (film.fallbackImageUrl && src !== film.fallbackImageUrl) setSrc(film.fallbackImageUrl);\n        else setFailed(true);\n      }}'''
if s.count(old_err)!=1: raise SystemExit('FilmImage error target drift')
s=s.replace(old_err,new_err)
if s.count('<FilmImage film={film} eager={index < 3} />')!=1: raise SystemExit('FilmCard eager target drift')
s=s.replace('<FilmImage film={film} eager={index < 3} />','<FilmImage film={film} compact />')
if s.count('<FilmImage film={film} eager={index < 2} decorative />')!=1: raise SystemExit('Featured eager target drift')
s=s.replace('<FilmImage film={film} eager={index < 2} decorative />','<FilmImage film={film} eager={index === 0} decorative />')
# Watch Now, secondary lanes and related cards use compact official material.
s=s.replace('<FilmImage film={film} decorative />','<FilmImage film={film} decorative compact />')
p.write_text(s)

# 6) Defer paint/layout work for Magazine sections below the first screen while keeping semantics and accessibility.
p=Path('src/styles/magazine-home-closure.css'); s=p.read_text()
marker='/* LIVE 07 measured performance containment */'
if marker not in s:
    s += '''\n\n/* LIVE 07 measured performance containment */\n.mag-home > section:not(.mag-home-hero):not(.mag-topic-river) {\n  content-visibility: auto;\n  contain-intrinsic-size: auto 900px;\n}\n@media (max-width: 640px) {\n  .mag-home > section:not(.mag-home-hero):not(.mag-topic-river) { contain-intrinsic-size: auto 1100px; }\n}\n'''
    p.write_text(s)

print('Closure 07 measured performance repair prepared.')
