// Configuración centralizada para autenticación
export const AUTH_CONFIG = {
  // URLs de redirección
  redirectUrls: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    dashboard: '/admin',
    home: '/',
    emailConfirm: '/auth/confirm',
  },
  
  // Configuración de Google OAuth
  google: {
    enabled: true,
    scopes: ['email', 'profile'],
  },
  
  // Configuración de email
  email: {
    confirmationRequired: true,
    resetPasswordUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    confirmEmailUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
  },
  
  // Configuración de sesión
  session: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  
  // Validaciones
  validation: {
    minPasswordLength: 6,
    requireEmailConfirmation: true,
  },
} as const

// Tipos para TypeScript
export type AuthRedirectUrl = keyof typeof AUTH_CONFIG.redirectUrls
