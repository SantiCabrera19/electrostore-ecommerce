/**
 * Argentine provinces data
 */

export interface Province {
  id: string
  name: string
  code: string
}

export const PROVINCES: Province[] = [
  { id: 'buenos-aires', name: 'Buenos Aires', code: 'BA' },
  { id: 'catamarca', name: 'Catamarca', code: 'CT' },
  { id: 'chaco', name: 'Chaco', code: 'CC' },
  { id: 'chubut', name: 'Chubut', code: 'CH' },
  { id: 'cordoba', name: 'Córdoba', code: 'CB' },
  { id: 'corrientes', name: 'Corrientes', code: 'CN' },
  { id: 'entre-rios', name: 'Entre Ríos', code: 'ER' },
  { id: 'formosa', name: 'Formosa', code: 'FM' },
  { id: 'jujuy', name: 'Jujuy', code: 'JY' },
  { id: 'la-pampa', name: 'La Pampa', code: 'LP' },
  { id: 'la-rioja', name: 'La Rioja', code: 'LR' },
  { id: 'mendoza', name: 'Mendoza', code: 'MZ' },
  { id: 'misiones', name: 'Misiones', code: 'MN' },
  { id: 'neuquen', name: 'Neuquén', code: 'NQ' },
  { id: 'rio-negro', name: 'Río Negro', code: 'RN' },
  { id: 'salta', name: 'Salta', code: 'SA' },
  { id: 'san-juan', name: 'San Juan', code: 'SJ' },
  { id: 'san-luis', name: 'San Luis', code: 'SL' },
  { id: 'santa-cruz', name: 'Santa Cruz', code: 'SC' },
  { id: 'santa-fe', name: 'Santa Fe', code: 'SF' },
  { id: 'santiago-del-estero', name: 'Santiago del Estero', code: 'SE' },
  { id: 'tierra-del-fuego', name: 'Tierra del Fuego', code: 'TF' },
  { id: 'tucuman', name: 'Tucumán', code: 'TM' },
  { id: 'caba', name: 'Ciudad Autónoma de Buenos Aires', code: 'CABA' }
]

export function getProvinceByCode(code: string): Province | undefined {
  return PROVINCES.find(province => province.code === code)
}

export function getProvinceById(id: string): Province | undefined {
  return PROVINCES.find(province => province.id === id)
}

export function getProvinceName(id: string): string {
  const province = getProvinceById(id)
  return province ? province.name : id
}
