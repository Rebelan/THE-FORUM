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

  if (cargando) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando avisos...</div>

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Notificaciones</h1>
            <p className="text-gray-500">Historial de tu actividad en la comunidad</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={marcarTodoLeido}>
            <CheckCheck className="w-4 h-4 mr-2" /> Marcar todas leídas
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {notificaciones.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-gray-500">Todo al día</h3>
            <p>No tienes notificaciones nuevas.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notificaciones.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => manejarClick(notif.id, notif.foro_id)}
                className={`p-6 cursor-pointer transition-all hover:bg-slate-50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${notif.leida ? 'opacity-70 bg-white' : 'bg-blue-50/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${notif.tipo === 'cita' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {notif.tipo === 'cita' ? <Quote className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-gray-800 text-lg">
                      <span className="font-bold">{notif.actor?.username}</span>{' '}
                      {notif.tipo === 'cita' ? 'citó tu mensaje en' : 'respondió a tu tema'}
                    </p>
                    <p className="font-bold text-gray-900 mt-0.5">"{notif.foros?.titulo}"</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0 sm:text-right pl-14 sm:pl-0">
                  <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {new Date(notif.created_at).toLocaleDateString()} a las {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!notif.leida && <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}