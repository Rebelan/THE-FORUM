import { Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Gamepad2, Users, MessageSquare } from 'lucide-react'

export default function Home() {
  const user = useAuthStore((state) => state.user)

  // Si el usuario ya tiene sesión iniciada, lo mandamos directo al dashboard
  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* BARRA DE NAVEGACIÓN */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-blue-600 font-black text-2xl tracking-tighter">
          <Gamepad2 className="w-8 h-8" />
          <span>THE FORUM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
            Iniciar Sesión
          </Link>
          <Link to="/register">
            <Button className="bg-blue-600 cursor-pointer hover:bg-blue-700">Registrarse</Button>
          </Link>
        </div>
      </header>

      {/* SECCIÓN HERO (BIENVENIDA) */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-linear-to-b from-white to-slate-100">
        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido a <span className="text-blue-600">THE FORUM</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            La comunidad donde los gamers debaten, comparten estrategias y conectan. 
            Busca tu juego favorito y empieza a participar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 cursor-pointer hover:bg-blue-700 w-full shadow-lg shadow-blue-200">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg w-full border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-50">
                Entrar a mi cuenta
              </Button>
            </Link>
          </div>
        </div>

        {/* RESUMEN DE FUNCIONES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mt-24 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Comunidades de RAWG</h3>
            <p className="text-gray-600">Acceso a una base de datos infinita de videojuegos para crear tus propios foros.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Postea lo que quieras</h3>
            <p className="text-gray-600">Debate de forma ordenada citando mensajes y respondiendo en hilos estructurados.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Perfiles Reales</h3>
            <p className="text-gray-600">Personaliza tu identidad y hazte un nombre dentro de la comunidad.</p>
          </div>
        </div>
      </main>
    </div>
  )
}