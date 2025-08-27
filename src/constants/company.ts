/**
 * Company information and configuration
 */

export interface CompanyInfo {
  name: string
  legalName: string
  address: string
  city: string
  province: string
  postalCode: string
  phone: string
  email: string
  website: string
  cuit: string
  taxStatus: string
  activityStartDate: string
  logo: string
}

export const COMPANY_INFO: CompanyInfo = {
  name: 'ElectroStore',
  legalName: 'ElectroStore S.A.',
  address: 'Av. Corrientes 1234',
  city: 'Buenos Aires',
  province: 'Ciudad Autónoma de Buenos Aires',
  postalCode: '1043',
  phone: '+54 11 4567-8900',
  email: 'info@electrostore.com.ar',
  website: 'www.electrostore.com.ar',
  cuit: '30-12345678-9',
  taxStatus: 'IVA RESPONSABLE INSCRIPTO',
  activityStartDate: '01/01/2020',
  logo: '/electrostore_Logo.png'
}

export const INVOICE_CONFIG = {
  currency: 'ARS',
  currencySymbol: '$',
  locale: 'es-AR',
  taxRate: 0.21, // 21% IVA
  defaultShippingCost: 0,
  defaultDiscountTotal: 0
}

export const BUSINESS_HOURS = {
  monday: '9:00 - 18:00',
  tuesday: '9:00 - 18:00',
  wednesday: '9:00 - 18:00',
  thursday: '9:00 - 18:00',
  friday: '9:00 - 18:00',
  saturday: '9:00 - 15:00',
  sunday: 'Cerrado'
}
