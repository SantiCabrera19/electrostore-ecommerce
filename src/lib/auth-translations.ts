/**
 * Traducciones en español para mensajes de autenticación de Supabase
 */

export const authTranslations: Record<string, string> = {
  // Errores comunes de Supabase
  'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
  'Email not confirmed': 'Email no confirmado. Revisa tu bandeja de entrada.',
  'User already registered': 'El usuario ya está registrado',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'Unable to validate email address: invalid format': 'Formato de email inválido',
  'Email address not authorized': 'Dirección de email no autorizada',
  'Invalid email or password': 'Email o contraseña incorrectos',
  'Too many requests': 'Demasiadas solicitudes. Intenta más tarde.',
  'Signup is disabled': 'El registro está deshabilitado',
  'Email link is invalid or has expired': 'El enlace de email es inválido o ha expirado',
  'Token has expired or is invalid': 'El token ha expirado o es inválido',
  'User not found': 'Usuario no encontrado',
  'Email rate limit exceeded': 'Límite de emails excedido. Intenta más tarde.',
  'Password is too weak': 'La contraseña es muy débil',
  'New password should be different from the old password': 'La nueva contraseña debe ser diferente a la anterior',
  
  // Mensajes de estado
  'Loading...': 'Cargando...',
  'Sign In': 'Iniciar Sesión',
  'Sign Up': 'Registrarse',
  'Create Account': 'Crear Cuenta',
  'Sign Out': 'Cerrar Sesión',
  'Forgot Password?': '¿Olvidaste tu contraseña?',
  'Reset Password': 'Restablecer Contraseña',
  'Update Password': 'Actualizar Contraseña',
  'Confirm Password': 'Confirmar Contraseña',
  'Email': 'Email',
  'Password': 'Contraseña',
  'Full Name': 'Nombre Completo',
  'Phone': 'Teléfono',
  'Address': 'Dirección',
  
  // Mensajes de éxito
  'Registration successful': 'Registro exitoso',
  'Login successful': 'Inicio de sesión exitoso',
  'Password updated successfully': 'Contraseña actualizada exitosamente',
  'Email confirmation sent': 'Confirmación de email enviada',
  'Password reset email sent': 'Email de restablecimiento enviado',
  
  // Mensajes de confirmación
  'Check your email for confirmation': 'Revisa tu email para confirmar tu cuenta',
  'Account confirmed successfully': 'Cuenta confirmada exitosamente',
  'Please confirm your email address': 'Por favor confirma tu dirección de email',
  
  // Mensajes de validación
  'Email is required': 'El email es requerido',
  'Password is required': 'La contraseña es requerida',
  'Passwords do not match': 'Las contraseñas no coinciden',
  'Please enter a valid email': 'Por favor ingresa un email válido',
  'Full name is required': 'El nombre completo es requerido',
}

/**
 * Traduce un mensaje de autenticación al español
 */
export function translateAuthMessage(message: string): string {
  // Buscar traducción exacta
  if (authTranslations[message]) {
    return authTranslations[message]
  }
  
  // Buscar traducción parcial (para mensajes que contienen variables)
  for (const [key, translation] of Object.entries(authTranslations)) {
    if (message.includes(key)) {
      return message.replace(key, translation)
    }
  }
  
  // Si no hay traducción, devolver el mensaje original
  return message
}

/**
 * Valida un email usando regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida una contraseña (mínimo 6 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * Genera mensajes de validación en español
 */
export function getValidationMessage(field: string, value: string): string | null {
  switch (field) {
    case 'email':
      if (!value) return 'El email es requerido'
      if (!isValidEmail(value)) return 'Por favor ingresa un email válido'
      return null
      
    case 'password':
      if (!value) return 'La contraseña es requerida'
      if (!isValidPassword(value)) return 'La contraseña debe tener al menos 6 caracteres'
      return null
      
    case 'fullName':
      if (!value.trim()) return 'El nombre completo es requerido'
      return null
      
    case 'confirmPassword':
      if (!value) return 'Debes confirmar tu contraseña'
      return null
      
    default:
      return null
  }
}
