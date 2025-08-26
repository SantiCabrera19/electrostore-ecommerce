import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react"

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 bg-card border-t border-border">
      {/* Barra de suscripción */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center gap-3 justify-between">
          <p className="text-sm md:text-base font-medium">
            ¡No te pierdas una oferta! Suscribite y recibí los mejores beneficios.
          </p>
          <form className="flex w-full md:w-auto items-center gap-2">
            <Input
              type="email"
              placeholder="Ingresá tu email"
              className="bg-primary-foreground text-foreground w-full md:w-80"
              aria-label="Email para suscripción"
            />
            <Button type="submit" variant="secondary">Suscribirme</Button>
          </form>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-serif font-bold text-primary">ElectroStore</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ofertas válidas por tiempo limitado o hasta agotar stock. Imágenes a modo ilustrativo.
              Precios y descripciones pueden variar sin previo aviso.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link aria-label="Facebook" href="#" className="p-2 rounded-full border border-border hover:bg-muted transition">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link aria-label="Instagram" href="#" className="p-2 rounded-full border border-border hover:bg-muted transition">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link aria-label="YouTube" href="#" className="p-2 rounded-full border border-border hover:bg-muted transition">
                <Youtube className="h-4 w-4" />
              </Link>
              <Link aria-label="X" href="#" className="p-2 rounded-full border border-border hover:bg-muted transition">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Categorías</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Tecnología</Link></li>
              <li><Link href="#" className="hover:text-primary">Electrodomésticos</Link></li>
              <li><Link href="#" className="hover:text-primary">Hogar y Jardín</Link></li>
              <li><Link href="#" className="hover:text-primary">Bazaar y Decoración</Link></li>
              <li><Link href="#" className="hover:text-primary">Herramientas</Link></li>
            </ul>
          </div>

          {/* Lo más buscado */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Lo más buscado</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Televisores</Link></li>
              <li><Link href="#" className="hover:text-primary">Lavarropas</Link></li>
              <li><Link href="#" className="hover:text-primary">Celulares</Link></li>
              <li><Link href="#" className="hover:text-primary">Heladeras</Link></li>
            </ul>
          </div>

          {/* Sobre nosotros */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">ElectroStore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Sobre nosotros</Link></li>
              <li><Link href="#" className="hover:text-primary">Trabajá con nosotros</Link></li>
              <li><Link href="#" className="hover:text-primary">Sucursales</Link></li>
              <li><Link href="#" className="hover:text-primary">Información legal</Link></li>
              <li><Link href="#" className="hover:text-primary">Venta a empresas</Link></li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Información</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Centro de ayuda</Link></li>
              <li><Link href="#" className="hover:text-primary">Contactanos</Link></li>
              <li><Link href="#" className="hover:text-primary">Marketing y Proveedores</Link></li>
              <li><Link href="#" className="hover:text-primary">Botón de arrepentimiento</Link></li>
              <li><Link href="#" className="hover:text-primary">Libro de quejas online</Link></li>
              <li><Link href="#" className="hover:text-primary">Defensa del consumidor</Link></li>
              <li><Link href="#" className="hover:text-primary">Servicios financieros</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Línea legal inferior */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted-foreground flex flex-col md:flex-row gap-3 items-center justify-between">
          <p>© {year} ElectroStore. Todos los derechos reservados.</p>
          <p className="text-center md:text-right">
            Precios en ARS. Imágenes no contractuales. Condiciones sujetas a cambios sin previo aviso.
          </p>
        </div>
      </div>
    </footer>
  )
}