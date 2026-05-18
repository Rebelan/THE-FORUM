import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Menu, MessageSquare, Users, Settings, LogOut, Home as HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [perfil, setPerfil] = useState<any>(null)

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Función para pedir los datos a Supabase
    const cargarDatos = () => {
      if (user) {
        supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setPerfil(data)
          })
      }
    }

    cargarDatos()

  
    window.addEventListener('perfilActualizado', cargarDatos)

    return () => window.removeEventListener('perfilActualizado', cargarDatos)
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const menuItems = [
    { name: 'Inicio', icon: HomeIcon, path: '/app' },
    { name: 'Foros', icon: MessageSquare, path: '/app/foros' },
    ...(perfil?.rol_id === 1 ? [{ name: 'Usuarios', icon: Users, path: '/app/usuarios' }] : []),
  ]

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
        {!isCollapsed && <span className="font-bold text-xl text-blue-600 tracking-wider">THE FORUM</span>}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className={isCollapsed ? "mx-auto" : ""}>
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {perfil && (
        <div className="px-3 pt-4 shrink-0">
          <Link to="/app/perfil" className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden border border-blue-200">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                perfil.username?.charAt(0).toUpperCase()
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-gray-900 truncate">{perfil.username}</p>
                <p className="text-xs text-blue-600 font-medium">Ver perfil</p>
              </div>
            )}
          </Link>
          <hr className="mt-4 border-gray-200" />
        </div>
      )}

      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.name} to={item.path}>
              <Button variant={isActive ? "secondary" : "ghost"} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} mb-1`} title={isCollapsed ? item.name : ""}>
                <item.icon className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-2 shrink-0">
        <Button variant="ghost" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Settings className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && <span>Ajustes</span>}
        </Button>
        <Button variant="destructive" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`} onClick={handleLogout}>
          <LogOut className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  )
}