'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type Banner = {
  id: string
  image_url: string | null
  title?: string | null
  subtitle?: string | null
  cta_label?: string | null
  cta_href?: string | null
}

type Props = {
  banners: Banner[]
  intervalMs?: number
}

export default function HeroCarousel({ banners, intervalMs = 5000 }: Props) {
  const safeBanners = useMemo(() => (Array.isArray(banners) ? banners : []), [banners])
  const [index, setIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringRef = useRef(false)

  const next = () => setIndex((i) => (i + 1) % Math.max(1, safeBanners.length || 1))
  const prev = () => setIndex((i) => (i - 1 + Math.max(1, safeBanners.length || 1)) % Math.max(1, safeBanners.length || 1))

  useEffect(() => {
    if (!safeBanners.length) return
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!isHoveringRef.current) next()
    }, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [safeBanners.length, intervalMs])

  const onMouseEnter = () => { isHoveringRef.current = true }
  const onMouseLeave = () => { isHoveringRef.current = false }

  const hasBanners = safeBanners.length > 0

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-card" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Responsive aspect wrapper: 16:9 (mobile) → ~2.4:1 (sm) → 4:1 (lg) → 4.5:1 (xl) */}
      <div className="relative w-full pb-[56.25%] sm:pb-[41.66%] lg:pb-[25%] xl:pb-[22.22%]">
        <div className="absolute inset-0">
          {/* Slides */}
          <div
            className="h-full flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(hasBanners ? index : 0) * 100}%)`, width: `${(hasBanners ? safeBanners.length : 1) * 100}%` }}
          >
            {hasBanners ? (
              safeBanners.map((b) => (
                <div key={b.id} className="relative min-w-full h-full">
                  {b.image_url ? (
                    <Image src={b.image_url} alt={b.title || 'banner'} fill priority className="object-cover" sizes="100vw" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                  )}

                  {/* Dark overlay to improve contrast */}
                  <div className="absolute inset-0 bg-black/35" />

                  {(b.title || b.subtitle || (b.cta_label && b.cta_href)) && (
                    <div className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 max-w-[520px] p-4 sm:p-6 rounded">
                      {b.title && <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white drop-shadow-md">{b.title}</h2>}
                      {b.subtitle && <p className="mt-2 text-sm sm:text-base text-gray-100/90 drop-shadow">{b.subtitle}</p>}
                      {b.cta_label && b.cta_href && (
                        <Link href={b.cta_href} className="inline-block mt-4 px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 transition">
                          {b.cta_label}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Placeholder slide (no data yet)
              <div className="relative min-w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-primary/10 to-transparent" />
                <div className="relative z-10 text-center p-6">
                  <h2 className="text-2xl sm:text-4xl font-bold">Tu banner principal va acá</h2>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground">Cargalo desde el Admin en la próxima etapa</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <button aria-label="Anterior" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/70 hover:bg-background/90 shadow flex items-center justify-center">
            <span className="sr-only">Anterior</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button aria-label="Siguiente" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/70 hover:bg-background/90 shadow flex items-center justify-center">
            <span className="sr-only">Siguiente</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Dots */}
          {hasBanners && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
              {safeBanners.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} aria-label={`Ir al slide ${i + 1}`} className={`h-2.5 rounded-full transition-all ${i === index ? 'w-5 bg-primary' : 'w-2.5 bg-foreground/30'}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
