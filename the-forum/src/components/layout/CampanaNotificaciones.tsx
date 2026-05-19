import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Bell, MessageSquare, Quote, CheckCheck } from 'lucide-react'

export function CampanaNotificaciones() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [abierto, setAbierto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const cargarNotificaciones = async () => {
    if (!user) return
    const { data } = await supabase
      .from('notificaciones')
      .select('*, actor:actor_id(username), foros(titulo)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      setNotificaciones(data)
      setNoLeidas(data.filter(n => !n.leida).length)
    }
  }

  useEffect(() => {
    cargarNotificaciones()
    const handleClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [user])

  const marcarComoLeida = async (id: string, foroId: string) => {
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id)
    setAbierto(false)
    cargarNotificaciones()
    navigate(`/app/foro/${foroId}`)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* ICONO DE CAMPANA */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="relative p-2.5 text-slate-400 hover:text-violet-400 hover:bg-slate-900 rounded-full transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {noLeidas}
          </span>
        )}
      </button>

      {/* MENÚ DESPLEGABLE */}
      {abierto && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-75 sm:w-80 max-w-[90vw] bg-slate-950 rounded-xl shadow-2xl shadow-black/50 border border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
            <span className="font-bold text-sm text-slate-100">Notificaciones</span>
            {noLeidas > 0 && (
              <button
                onClick={async () => {
                  await supabase.from('notificaciones').update({ leida: true }).eq('usuario_id', user?.id)
                  cargarNotificaciones()
                }}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar leídas
              </button>
            )}
          </div>

          <div className="max-h-75 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No tienes notificaciones.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => marcarComoLeida(notif.id, notif.foro_id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-900 flex gap-3 items-start ${notif.leida ? 'opacity-50 bg-slate-950' : 'bg-violet-900/10'}`}
                  >
                    <div className="mt-1 shrink-0">
                      {notif.tipo === 'cita' ? <Quote className="w-5 h-5 text-violet-500" /> : <MessageSquare className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-300 line-clamp-2">
                        <span className="font-bold text-slate-100">{notif.actor?.username}</span>{' '}
                        {notif.tipo === 'cita' ? 'citó tu mensaje en' : 'respondió a tu tema'} <br />
                        <span className="font-semibold text-violet-300">"{notif.foros?.titulo}"</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.leida && <div className="w-2 h-2 bg-violet-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 bg-slate-900 border-t border-slate-800 text-center">
            <button
              onClick={() => { setAbierto(false); navigate('/app/notificaciones'); }}
              className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  )
}