'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export type Banner = {
  id: string
  title: string | null
  subtitle: string | null
  cta_label: string | null
  cta_href: string | null
  position: number
}

export function useBanners() {
  const supabase = createBrowserClient()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('banners')
        .select('id, title, subtitle, cta_label, cta_href, position')
        .order('position', { ascending: true })
      if (error) throw error
      setBanners((data || []) as Banner[])
    } catch (err) {
      console.error('Error loading banners', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { load() }, [load])

  const create = async (input: Omit<Banner, 'id' | 'position'>) => {
    const nextPos = (banners[banners.length - 1]?.position ?? -1) + 1
    const { data, error } = await supabase
      .from('banners')
      .insert({ ...input, position: nextPos })
      .select('*')
      .single()
    if (error) throw error
    setBanners((prev) => [...prev, data as Banner].sort((a, b) => a.position - b.position))
    return data as Banner
  }

  const update = async (id: string, patch: Partial<Omit<Banner, 'id'>>) => {
    const { data, error } = await supabase
      .from('banners')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    setBanners((prev) => prev.map((b) => (b.id === id ? (data as Banner) : b)).sort((a, b) => a.position - b.position))
    return data as Banner
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw error
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }

  const move = async (id: string, direction: 'up' | 'down') => {
    const idx = banners.findIndex((b) => b.id === id)
    if (idx === -1) return
    const swapWith = direction === 'up' ? idx - 1 : idx + 1
    if (swapWith < 0 || swapWith >= banners.length) return
    const a = banners[idx]
    const b = banners[swapWith]
    // Optimistic update
    setBanners((prev) => {
      const copy = [...prev]
      copy[idx] = { ...b, position: a.position }
      copy[swapWith] = { ...a, position: b.position }
      return copy.sort((x, y) => x.position - y.position)
    })
    // Persist both updates
    await Promise.all([
      supabase.from('banners').update({ position: b.position }).eq('id', a.id),
      supabase.from('banners').update({ position: a.position }).eq('id', b.id),
    ])
    await load()
  }

  return { banners, loading, error, reload: load, create, update, remove, move }
}
