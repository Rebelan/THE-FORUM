import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Menu, MessageSquare, Users, Settings, LogOut, Home as HomeIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false) 
  const [perfil, setPerfil] = useState<any>(null)

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
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

  const handleCerrarMovil = () => {
    setIsMobileOpen(false)
  }

  const menuItems = [
    { name: 'Inicio', icon: HomeIcon, path: '/app' },
    { name: 'Foros', icon: MessageSquare, path: '/app/foros' },
    ...(perfil?.rol_id === 1 ? [{ name: 'Usuarios', icon: Users, path: '/app/usuarios' }] : []),
  ]


  return (
    <>
      {!isMobileOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 bg-slate-900/90 backdrop-blur-sm shadow-xl border border-slate-700 rounded-lg hover:bg-slate-800"
        >
          <Menu className="h-5 w-5 text-slate-100" />
        </Button>
      )}

      {/* OVERLAY OSCURO */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-[2px] z-40 md:hidden transition-opacity"
          onClick={handleCerrarMovil}
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-950 border-r border-slate-800 transition-all duration-300 flex flex-col h-full
          ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full w-72'} 
          md:relative md:translate-x-0 
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* CABECERA */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <span className={`font-black text-xl text-violet-500 tracking-wider group ${isCollapsed ? 'hidden md:hidden' : 'block'}`}>
            THE <span className='group-hover:text-white transition-colors'>FORUM</span>
          </span>

          <Button variant="ghost" size="icon" onClick={handleCerrarMovil} className="md:hidden ml-auto text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`hidden md:flex ${isCollapsed ? "mx-auto" : "ml-auto"} text-slate-400 hover:text-white`}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* SECCIÓN DEL PERFIL */}
        {perfil && (
          <div className="px-3 pt-4 shrink-0 bg-slate-950/50">
            <Link 
              to="/app/perfil" 
              onClick={handleCerrarMovil}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-900 transition-colors group ${isCollapsed ? 'md:justify-center' : ''}`}
            >
              <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-violet-400 font-black shrink-0 overflow-hidden border-2 border-slate-700 group-hover:border-violet-500 transition-colors">
                {perfil.avatar_url ? (
                  <img src={perfil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  perfil.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className={`flex-1 min-w-0 text-left ${isCollapsed ? 'md:hidden' : 'block'}`}>
                <p className="text-sm font-extrabold text-slate-100 truncate">{perfil.username}</p>
                <p className="text-xs text-violet-400 font-medium group-hover:text-white transition-colors">Ver perfil</p>
              </div>
            </Link>
            <hr className="mt-4 border-slate-800" />
          </div>
        )}

        {/* NAVEGACIÓN */}
        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto bg-slate-950">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.name} to={item.path} onClick={handleCerrarMovil}>
                <Button 
                  variant="ghost" 
                  className={`
                    w-full flex items-center mb-1 group rounded-lg h-11
                    ${isCollapsed ? 'md:justify-center' : 'justify-start'}
                    ${isActive ? 'bg-violet-600/20 text-violet-200 font-bold' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}
                  `}
                  title={isCollapsed ? item.name : ""}
                >
                  <item.icon className={`h-5 w-5 ${!isCollapsed && "md:mr-3"} ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-300'}`} />
                  <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* PIE DE SIDEBAR */}
        <div className="p-3 border-t border-slate-800 space-y-2 shrink-0 bg-slate-950/80">
          <Button 
            variant="ghost" 
            className={`w-full flex items-center text-slate-300 hover:bg-slate-900 hover:text-white ${isCollapsed ? 'md:justify-center' : 'justify-start'}`}
          >
            <Settings className={`h-5 w-5 text-slate-400 ${!isCollapsed && "md:mr-3"} ${isCollapsed ? '' : 'mr-3'}`} />
            <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>Ajustes</span>
          </Button>
          <Button 
            variant="destructive" 
            className={`w-full flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-start'} h-11`}
            onClick={handleLogout}
          >
            <LogOut className={`h-5 w-5 ${!isCollapsed && "md:mr-3"} ${isCollapsed ? '' : 'mr-3'}`} />
            <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>Cerrar sesión</span>
          </Button>
        </div>
      </aside>
    </>
  )
}