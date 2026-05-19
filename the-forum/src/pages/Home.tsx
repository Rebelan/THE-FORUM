import { Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Gamepad2, Users, MessageSquare, Zap } from 'lucide-react'

export default function Home() {
  const user = useAuthStore((state) => state.user)

  // Si el usuario ya tiene sesión iniciada, lo mandamos directo al dashboard
  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-200">
      
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* <header className="relative z-10 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 text-violet-500 font-black text-2xl tracking-tighter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <Gamepad2 className="w-8 h-8 animate-pulse" />
          <span>THE FORUM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
            Iniciar Sesión
          </Link>
          <Link to="/register">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all">
              Unirse
            </Button>
          </Link>
        </div>
      </header> */}

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 mt-10 md:mt-0">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-900/30 border border-violet-500/30 text-violet-300 text-xs md:text-sm font-bold mb-2 uppercase tracking-wider shadow-[0_0_10px_rgba(139,92,246,0.2)]">
            <Zap className="w-4 h-4 text-violet-400" /> La nueva era del debate
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-lg">
            Bienvenido a <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-blue-500 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              THE FORUM
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
            Adentrate a la comunidad más grande de jugadores y debate sobre lo que quieras, cuando quieras y con quien quieras.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-violet-600 hover:bg-violet-700 w-full shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-105 transition-all duration-300">
                Crear cuenta gratis
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg font-bold w-full bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-sm transition-all duration-300">
                Entrar a mi cuenta
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full mt-32 mb-20 text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          
          <div className="group bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(139,92,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="w-14 h-14 bg-violet-900/40 text-violet-400 rounded-xl border border-violet-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-violet-300 transition-colors">Comunidades de RAWG</h3>
            <p className="text-slate-400 leading-relaxed font-medium">Acceso a una base de datos infinita de videojuegos para buscar tus favoritos y crear tus propios foros.</p>
          </div>

          <div className="group bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="w-14 h-14 bg-blue-900/40 text-blue-400 rounded-xl border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-300 transition-colors">Postea lo que quieras</h3>
            <p className="text-slate-400 leading-relaxed font-medium">Debate de forma ordenada citando mensajes y respondiendo en hilos estructurados.</p>
          </div>

          <div className="group bg-slate-900/40 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-700"></div>
            <div className="w-14 h-14 bg-emerald-900/40 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-emerald-300 transition-colors">Interactúa con quien quieras</h3>
            <p className="text-slate-400 leading-relaxed font-medium">Sube tu foto de perfil, personaliza tu identidad y hazte un nombre respetado dentro de la comunidad de jugadores.</p>
          </div>

        </div>
      </main>
    </div>
  )
}