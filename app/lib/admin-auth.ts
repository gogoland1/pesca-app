// Simple admin authentication system
const ADMIN_PASSWORD = 'pesca_admin_2025' // Change this in production

interface AuthResult {
  success: boolean
  error?: string
}

export function authenticateAdmin(password: string): AuthResult {
  if (password === ADMIN_PASSWORD) {
    // Store admin session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pesca_admin_auth', 'true')
      sessionStorage.setItem('pesca_admin_timestamp', Date.now().toString())
    }
    return { success: true }
  }
  
  return { 
    success: false, 
    error: 'Contraseña incorrecta' 
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const isAuth = sessionStorage.getItem('pesca_admin_auth')
  const timestamp = sessionStorage.getItem('pesca_admin_timestamp')
  
  if (!isAuth || isAuth !== 'true' || !timestamp) {
    return false
  }
  
  // Check if session is not older than 24 hours
  const sessionTime = parseInt(timestamp)
  const now = Date.now()
  const twentyFourHours = 24 * 60 * 60 * 1000
  
  if (now - sessionTime > twentyFourHours) {
    // Session expired
    clearAdminSession()
    return false
  }
  
  return true
}

export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('pesca_admin_auth')
    sessionStorage.removeItem('pesca_admin_timestamp')
  }
}

export function refreshAdminSession(): void {
  if (typeof window !== 'undefined' && isAdminAuthenticated()) {
    sessionStorage.setItem('pesca_admin_timestamp', Date.now().toString())
  }
}