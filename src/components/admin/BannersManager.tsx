'use client'

import { useMemo, useState } from 'react'
import { useBanners } from '@/hooks/useBanners'
import { useProducts } from '@/hooks/useProducts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react'

export default function BannersManager() {
  const { banners, loading, error, create, update, remove, move } = useBanners()
  const { products, loading: loadingProducts } = useProducts()
  const [creating, setCreating] = useState(false)
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    cta_label: '',
    cta_href: '',
  })

  // Ya no se suben imágenes: las promociones son tarjetas de texto

  const getSlug = (href?: string | null) => {
    if (!href) return ''
    return href.replace(/^\/?(producto|products?)\//, '').replace(/^\//, '').trim()
  }

  const productOptions = useMemo(() => {
    return products.map((p) => ({ value: p.slug as string, label: p.name }))
  }, [products])

  const handleCreate = async () => {
    try {
      setCreating(true)
      await create({
        title: newBanner.title || null,
        subtitle: newBanner.subtitle || null,
        cta_label: newBanner.cta_label || null,
        cta_href: newBanner.cta_href || null,
      })
      setNewBanner({ title: '', subtitle: '', cta_label: '', cta_href: '' })
    } catch (e) {
      console.error(e)
      alert('Error al crear promoción')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">Gestión de Promociones</span>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando promociones...</p>
      ) : error ? (
        <p className="text-destructive">Error: {error}</p>
      ) : null}

      {/* Crear nueva promo */}
      <div className="rounded-lg border p-4 mb-8">
        <h3 className="font-semibold mb-3">Nueva promoción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} placeholder="Ej: Ofertas de Primavera"/>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Subtítulo</Label>
            <Textarea rows={2} value={newBanner.subtitle} onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })} placeholder="Texto descriptivo"/>
          </div>
          <div className="space-y-2">
            <Label>CTA Label</Label>
            <Input value={newBanner.cta_label} onChange={(e) => setNewBanner({ ...newBanner, cta_label: e.target.value })} placeholder="Ver más"/>
          </div>
          <div className="space-y-2">
            <Label>Producto (rellena el slug)</Label>
            <Select onValueChange={(slug) => setNewBanner((s) => ({ ...s, cta_href: slug, cta_label: s.cta_label || 'Ver producto' }))}>
              <SelectTrigger>
                <SelectValue placeholder={loadingProducts ? 'Cargando productos...' : 'Elegir producto'} />
              </SelectTrigger>
              <SelectContent>
                {productOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Seleccionar un producto guardará su slug en el campo de abajo. También podés editarlo manualmente.</p>
          </div>
          <div className="space-y-2">
            <Label>CTA URL (slug del producto o ruta)</Label>
            <Input value={newBanner.cta_href} onChange={(e) => setNewBanner({ ...newBanner, cta_href: e.target.value })} placeholder="smart-tv-55-4k-samsung o /producto/smart-tv-55-4k-samsung"/>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={handleCreate} disabled={creating}>{creating ? 'Creando...' : 'Crear promoción'}</Button>
        </div>
      </div>

      {/* Listado */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">Promociones actuales</span>
        </div>
      </div>

      <div className="space-y-4">
        {banners.length === 0 ? (
          <p className="text-muted-foreground">No hay promociones aún.</p>
        ) : (
          banners.map((b, idx) => (
            <div key={b.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Título</Label>
                    <Input defaultValue={b.title ?? ''} onBlur={(e) => update(b.id, { title: e.target.value || null })}/>
                  </div>
                  <div className="space-y-1">
                    <Label>CTA Label</Label>
                    <Input defaultValue={b.cta_label ?? ''} onBlur={(e) => update(b.id, { cta_label: e.target.value || null })}/>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>Subtítulo</Label>
                    <Textarea rows={2} defaultValue={b.subtitle ?? ''} onBlur={(e) => update(b.id, { subtitle: e.target.value || null })}/>
                  </div>
                  <div className="space-y-1">
                    <Label>Producto (rellena el slug)</Label>
                    <Select
                      defaultValue={getSlug(b.cta_href ?? '') || undefined}
                      onValueChange={(slug) => update(b.id, { cta_href: slug })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingProducts ? 'Cargando productos...' : 'Elegir producto'} />
                      </SelectTrigger>
                      <SelectContent>
                        {productOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Al elegir un producto se guarda su slug; podés editar abajo si necesitás una ruta distinta.</p>
                  </div>
                  <div className="space-y-1">
                    <Label>CTA URL (slug del producto o ruta)</Label>
                    <Input defaultValue={b.cta_href ?? ''} onBlur={(e) => update(b.id, { cta_href: e.target.value || null })}/>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => move(b.id, 'up')} disabled={idx === 0}>
                    <ArrowUp className="h-4 w-4 mr-1"/> Subir
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => move(b.id, 'down')} disabled={idx === banners.length - 1}>
                    <ArrowDown className="h-4 w-4 mr-1"/> Bajar
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="destructive" size="sm" onClick={() => { if (confirm('¿Eliminar promoción?')) remove(b.id) }}>
                    <Trash2 className="h-4 w-4 mr-1"/> Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
