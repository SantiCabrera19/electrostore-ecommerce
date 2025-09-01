"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createBrowserClient } from "@/lib/supabase"

export type Promo = {
  id: string
  title?: string | null
  subtitle?: string | null
  cta_label?: string | null
  cta_href?: string | null
}

type Props = {
  promos: Promo[]
  intervalMs?: number
}

export default function PromoCardsCarousel({ promos, intervalMs = 5000 }: Props) {
  const safe = useMemo(() => (Array.isArray(promos) ? promos : []), [promos])
  const [index, setIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringRef = useRef(false)
  const supabase = createBrowserClient()

  type Prod = { id: string; name: string; price: number; compare_at_price: number | null; main_image: string | null; images: string[] | null; slug: string }
  const [prodBySlug, setProdBySlug] = useState<Record<string, Prod | null>>({})

  const next = () => setIndex((i) => (i + 1) % Math.max(1, safe.length || 1))
  const prev = () => setIndex((i) => (i - 1 + Math.max(1, safe.length || 1)) % Math.max(1, safe.length || 1))

  useEffect(() => {
    if (!safe.length) return
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!isHoveringRef.current) next()
    }, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [safe.length, intervalMs])

  const onMouseEnter = () => { isHoveringRef.current = true }
  const onMouseLeave = () => { isHoveringRef.current = false }

  const has = safe.length > 0

  // Parse slug from cta_href, accepting "/producto/<slug>" or plain "<slug>"
  const getSlug = (href?: string | null) => {
    if (!href) return null
    const cleaned = href.replace(/^\/?(producto|products?)\//, "").replace(/^\//, "").trim()
    return cleaned || null
  }

  // Fetch product data for referenced slugs
  useEffect(() => {
    const slugs = Array.from(new Set(safe.map((p) => getSlug(p.cta_href)).filter((s): s is string => !!s)))
    const missing = slugs.filter((s) => !(s in prodBySlug))
    if (!missing.length) return
    
    const fetchProducts = async () => {
      const fetched: Record<string, Prod | null> = {}
      for (const slug of missing) {
        const { data, error } = await supabase
          .from("products")
          .select("id,name,price,compare_at_price,main_image,images,slug")
          .eq("slug", slug)
          .maybeSingle()
        
        fetched[slug] = error ? null : (data as any) ?? null
        if (error) console.error("Error fetching product:", slug, error.message)
      }
      setProdBySlug((prev) => ({ ...prev, ...fetched }))
    }
    
    fetchProducts()
  }, [safe.map((p) => p.cta_href).join("|"), supabase])

  // Gradient palette
  const gradients = [
    "linear-gradient(120deg, hsl(174 70% 35%), hsl(174 80% 40%), hsl(174 70% 30%))",
    "linear-gradient(120deg, hsl(222 75% 40%), hsl(252 70% 45%), hsl(280 60% 40%))",
    "linear-gradient(120deg, hsl(14 90% 55%), hsl(24 85% 55%), hsl(10 80% 50%))",
    "linear-gradient(120deg, hsl(210 80% 35%), hsl(190 70% 40%), hsl(200 65% 35%))",
  ] as const
  
  const pickGradient = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
    return gradients[hash % gradients.length]
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-card isolate" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Responsive aspect wrapper: 16:9 (mobile) → ~2.4:1 (sm) → 4:1 (lg) → 4.5:1 (xl) */}
      <div className="relative w-full pb-[56.25%] sm:pb-[41.66%] lg:pb-[25%] xl:pb-[22.22%]">
        <div className="absolute inset-0">
          {/* Slides */}
          <div
            className="h-full flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(has ? index : 0) * 100}%)`, width: `${(has ? safe.length : 1) * 100}%` }}
          >
            {has ? (
              safe.map((p) => (
                <div key={p.id} className="relative min-w-full h-full isolate">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                    <div className="absolute -inset-1 animate-slow-pan opacity-90" style={{ backgroundImage: pickGradient(p.id), backgroundSize: "200% 200%" }} />
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(1200px_400px_at_0%_0%,white,transparent),radial-gradient(800px_300px_at_100%_100%,white,transparent)]" />
                  </div>

                  {/* Left content */}
                  {(p.title || p.subtitle || (p.cta_label && p.cta_href)) && (
                    <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 max-w-[620px] p-4 sm:p-6 z-40">
                      {p.title && <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white drop-shadow-md">{p.title}</h2>}
                      {p.subtitle && <p className="mt-2 text-sm sm:text-base text-white/90 drop-shadow">{p.subtitle}</p>}
                      {p.cta_label && p.cta_href && (
                        <Link href={p.cta_href.startsWith("/") ? p.cta_href : `/producto/${p.cta_href}`} className="inline-block mt-4 px-4 py-2 rounded bg-background text-foreground hover:opacity-90 transition">
                          {p.cta_label}
                        </Link>
                      )}
                    </div>
                  )}

                </div>
              ))
            ) : (
              // Placeholder slide (no data yet)
              <div className="relative min-w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
                <div className="relative z-10 text-center p-6">
                  <h2 className="text-2xl sm:text-4xl font-bold text-white">Crea tu primera promoción</h2>
                  <p className="mt-2 text-sm sm:text-base text-gray-100/90">Administra promociones desde el panel de Admin</p>
                </div>
              </div>
            )}
          </div>

        {/* Product card */}
        {(() => {
          if (!has) return null
          const currentPromo = safe[index]
          const slug = getSlug(currentPromo?.cta_href)
          const prod = slug ? prodBySlug[slug] : null
          
          if (!slug) return null
          
          return (
            <div className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 -translate-x-32 w-[160px] sm:w-[180px] md:w-[200px] z-50 pointer-events-auto transition-all duration-500 ease-in-out">
              <div className="rounded-lg bg-white/95 backdrop-blur-sm shadow-xl ring-1 ring-black/10 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <div className="relative aspect-[5/3] bg-muted">
                  {prod?.main_image ? (
                    <Image src={prod.main_image} alt={prod.name} fill className="object-contain" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="text-2xl mb-1">📦</div>
                        <div>Cargando...</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs text-muted-foreground line-clamp-1">{prod?.slug ?? slug}</div>
                  <div className="font-semibold text-sm line-clamp-2">{prod?.name ?? 'Producto destacado'}</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <div className="text-primary font-bold">{typeof prod?.price === 'number' ? `$ ${prod.price.toLocaleString('es-AR')}` : '—'}</div>
                    {prod?.compare_at_price && (
                      <div className="text-xs text-muted-foreground line-through">$ {prod.compare_at_price.toLocaleString('es-AR')}</div>
                    )}
                  </div>
                  {currentPromo.cta_label && (
                    <Link href={`/producto/${slug}`} className="mt-3 inline-block w-full text-center text-sm py-2 rounded-md bg-primary text-white hover:opacity-90 transition-opacity">
                      {currentPromo.cta_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Navigation controls */}
        <button 
          aria-label="Anterior" 
          onClick={prev} 
          className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full z-[100] bg-black/70 text-white border border-black/40 hover:bg-black/80 shadow-2xl flex items-center justify-center transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          aria-label="Siguiente" 
          onClick={next} 
          className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full z-[100] bg-black/70 text-white border border-black/40 hover:bg-black/80 shadow-2xl flex items-center justify-center transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

          {/* Dots */}
          {has && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {safe.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} aria-label={`Ir al slide ${i + 1}`} className={`h-2.5 rounded-full transition-all ${i === index ? 'w-5 bg-background' : 'w-2.5 bg-background/50'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes slowPan {
          0% { transform: translate3d(0%, 0, 0); }
          50% { transform: translate3d(-10%, -10%, 0); }
          100% { transform: translate3d(0%, 0, 0); }
        }
        .animate-slow-pan { animation: slowPan 16s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
