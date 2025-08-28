// Traducciones para mensajes de autenticación y errores
export const AUTH_MESSAGES = {
  // Errores de autenticación
  'Invalid login credentials': 'Credenciales de acceso inválidas',
  'Email not confirmed': 'Email no confirmado',
  'User not found': 'Usuario no encontrado',
  'Invalid email': 'Email inválido',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'Email already registered': 'Email ya registrado',
  'Weak password': 'Contraseña débil',
  'Too many requests': 'Demasiadas solicitudes, intenta más tarde',
  'Network error': 'Error de conexión',
  
  // Mensajes de éxito
  'Check your email for the confirmation link': 'Revisa tu email para el enlace de confirmación',
  'Password updated successfully': 'Contraseña actualizada exitosamente',
  'Email updated successfully': 'Email actualizado exitosamente',
  'Account created successfully': 'Cuenta creada exitosamente',
  'Logged in successfully': 'Sesión iniciada exitosamente',
  'Logged out successfully': 'Sesión cerrada exitosamente',
  
  // Mensajes de formularios
  'Email': 'Email',
  'Password': 'Contraseña',
  'Confirm Password': 'Confirmar Contraseña',
  'Full Name': 'Nombre Completo',
  'Sign In': 'Iniciar Sesión',
  'Sign Up': 'Registrarse',
  'Sign Out': 'Cerrar Sesión',
  'Forgot Password?': '¿Olvidaste tu contraseña?',
  'Reset Password': 'Restablecer Contraseña',
  'Create Account': 'Crear Cuenta',
  'Already have an account?': '¿Ya tienes una cuenta?',
  'Don\'t have an account?': '¿No tienes una cuenta?',
  
  // Mensajes de validación
  'This field is required': 'Este campo es obligatorio',
  'Please enter a valid email': 'Por favor ingresa un email válido',
  'Passwords do not match': 'Las contraseñas no coinciden',
  'Password must be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  
  // Mensajes de carga
  'Loading...': 'Cargando...',
  'Signing in...': 'Iniciando sesión...',
  'Creating account...': 'Creando cuenta...',
  'Sending reset email...': 'Enviando email de restablecimiento...',
  
  // Mensajes de Google Auth
  'Sign in with Google': 'Iniciar sesión con Google',
  'Sign up with Google': 'Registrarse con Google',
  'Continue with Google': 'Continuar con Google',
} as const

// Función para traducir mensajes
export function translateAuthMessage(message: string): string {
  return AUTH_MESSAGES[message as keyof typeof AUTH_MESSAGES] || message
}

// Función para obtener mensaje de error traducido
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'Error desconocido'
  
  const message = error.message || error.error_description || error.toString()
  return translateAuthMessage(message)
}
