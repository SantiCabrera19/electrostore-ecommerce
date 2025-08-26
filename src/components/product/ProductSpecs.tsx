"use client"

interface ProductSpecsProps {
  product: any
}

export default function ProductSpecs({ product }: ProductSpecsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <details className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors" open>
        <summary className="cursor-pointer font-medium text-foreground">
          <span className="border-l-4 border-primary pl-2">Especificaciones técnicas</span>
        </summary>
        <div className="mt-4 text-sm">
          {product.specs && typeof product.specs === "object" ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {Object.entries(product.specs as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-border py-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{String(v)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="text-muted-foreground">Sin especificaciones</div>
          )}
        </div>
      </details>

      <details className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors" open>
        <summary className="cursor-pointer font-medium text-foreground">
          <span className="border-l-4 border-primary pl-2">Descripción</span>
        </summary>
        <div className="mt-4 text-sm text-foreground">
          {product.description ?? "Sin descripción"}
        </div>
      </details>
    </div>
  )
}
