import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

export function AuthGuard() {
  const user = useAuthStore((state) => state.user)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  // 1. Si Supabase aún está pensando, mostramos un spinner de carga
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // 2. Si ya pensó y no hay usuario, lo echamos al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. Si todo está bien, le dejamos pasar a las rutas hijas (el MainLayout)
  return <Outlet />
}