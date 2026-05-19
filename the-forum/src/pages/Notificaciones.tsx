import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Bell, MessageSquare, Quote, CheckCheck} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Notificaciones() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarTodas = async () => {
    if (!user) return
    const { data } = await supabase
      .from('notificaciones')
      .select('*, actor:actor_id(username), foros(titulo)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setNotificaciones(data)
    setCargando(false)
  }

  useEffect(() => {
    cargarTodas()
  }, [user])

  const manejarClick = async (id: string, foroId: string) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id)
    navigate(`/app/foro/${foroId}`)
  }

  const marcarTodoLeido = async () => {
    await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', user?.id)
    cargarTodas()
  }

  if (cargando) return <div className="p-8 pt-24 text-center text-slate-500 font-medium animate-pulse min-h-screen bg-background">Cargando avisos...</div>

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-hidden">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
        
        {/* CABECERA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-900/30 text-violet-400 rounded-xl border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Notificaciones</h1>
              <p className="text-slate-400 mt-1 font-medium">Historial de tu actividad en la comunidad</p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={marcarTodoLeido}
              className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <CheckCheck className="w-4 h-4 mr-2 text-violet-400" /> Marcar todas leídas
            </Button>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {notificaciones.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-20 text-slate-400" />
              <h3 className="text-xl font-bold text-slate-300">Todo al día</h3>
              <p className="mt-1 font-medium">No tienes notificaciones nuevas.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {notificaciones.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => manejarClick(notif.id, notif.foro_id)}
                  className={`p-4 md:p-6 cursor-pointer transition-all duration-200 hover:bg-slate-800 flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${
                    notif.leida 
                    ? 'opacity-60 bg-slate-900 hover:opacity-100' 
                    : 'bg-violet-900/10 border-l-4 border-l-violet-500'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div className={`p-3 rounded-full shrink-0 border ${
                      notif.tipo === 'cita' 
                      ? 'bg-violet-900/40 text-violet-400 border-violet-500/30' 
                      : 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {notif.tipo === 'cita' ? <Quote className="w-5 h-5 md:w-6 md:h-6" /> : <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    
                    <div>
                      <p className="text-slate-300 text-base md:text-lg leading-snug">
                        <span className="font-extrabold text-slate-100">{notif.actor?.username}</span>{' '}
                        {notif.tipo === 'cita' ? 'citó tu mensaje en' : 'respondió a tu tema'}
                      </p>
                      <p className="font-bold text-violet-300 mt-1 line-clamp-1">"{notif.foros?.titulo}"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0 sm:text-right pl-16 sm:pl-0">
                    <span className="text-xs md:text-sm text-slate-400 font-medium bg-slate-950 border border-slate-800 px-3 py-1 rounded-full">
                      {new Date(notif.created_at).toLocaleDateString()} a las {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!notif.leida && (
                      <span className="w-2.5 h-2.5 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.8)] shrink-0 animate-pulse"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}