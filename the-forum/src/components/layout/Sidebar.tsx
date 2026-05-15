// src/components/layout/Sidebar.tsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Menu, MessageSquare, Users, Settings, LogOut, Home as HomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const menuItems = [
    { name: 'Inicio', icon: HomeIcon, path: '/app' },
    { name: 'Foros', icon: MessageSquare, path: '/app/foros' },
    { name: 'Usuarios', icon: Users, path: '/app/usuarios' },
  ]

  return (
    <aside 
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && <span className="font-bold text-xl text-blue-600 tracking-wider">THE FORUM</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className={isCollapsed ? "mx-auto" : ""}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.name} to={item.path}>
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} mb-1`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-2">
        <Button variant="ghost" className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <Settings className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && <span>Ajustes</span>}
        </Button>
        <Button 
          variant="destructive" 
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 ${!isCollapsed && "mr-3"}`} />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  )
}