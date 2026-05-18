import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { rawgApi } from '@/lib/rawg'
import { CrearForoModal } from '@/components/foros/CrearForoModal'
import { Gamepad2, MessageSquareReply } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CampanaNotificaciones } from '@/components/layout/CampanaNotificaciones'

export default function Main() {
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)

    const [cargando, setCargando] = useState(true)
    const [forosRecientes, setForosRecientes] = useState<any[]>([])
    const [juegosRecientes, setJuegosRecientes] = useState<any[]>([])
    const [username, setUsername] = useState<string>('')

    const cargarDatosDashboard = async () => {
        try {
            if (user) {
                const { data: perfil } = await supabase
                    .from('usuarios')
                    .select('username')
                    .eq('id', user.id)
                    .single()
                if (perfil) setUsername(perfil.username)
            }

            const { data: dataForos } = await supabase
                .from('foros')
                .select(`*, videojuegos (*), categorias (*)`)
                .order('created_at', { ascending: false })
                .limit(15)

            if (dataForos) {
                const idsJuegosUnicos = Array.from(new Set(dataForos.map(f => f.videojuego_id).filter(Boolean)))
                
                const juegosConPortada = await Promise.all(
                    idsJuegosUnicos.slice(0, 10).map(async (id) => {
                        try {
                            return await rawgApi.getJuegoDetalle(id!.toString())
                        } catch (e) {
                            const foroRef = dataForos.find(f => f.videojuego_id === id)
                            return { id, name: foroRef?.videojuegos?.nombre || 'Desconocido', background_image: null }
                        }
                    })
                )

                setJuegosRecientes(juegosConPortada.filter(j => j?.background_image).slice(0, 4))

                const forosConImagen = dataForos.slice(0, 6).map(foro => {
                    const juegoInfo = juegosConPortada.find(j => j.id === foro.videojuego_id)
                    return {
                        ...foro,
                        imagen_juego: juegoInfo?.background_image || null
                    }
                })
                setForosRecientes(forosConImagen)
            }

        } catch (error) {
            console.error("Error al cargar datos:", error)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatosDashboard()
    }, [user]) 

    return (
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 bg-background min-h-screen text-foreground">

            {/* CABECERA*/}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Panel Principal</h1>
                    <p className="text-slate-400 mt-2.5 text-lg font-medium">
                        Bienvenido de nuevo, <span className="font-bold text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">{username || user?.email}</span>
                    </p>
                </div>

                <div className="flex items-center gap-5">
                    <CampanaNotificaciones /> 
                    <div className="h-10 w-px bg-slate-800 hidden sm:block"></div>
                    <CrearForoModal onCreado={cargarDatosDashboard} />
                </div>
            </div>

            {/* JUEGOS CON ACTIVIDAD RECIENTE (TENDENCIAS) */}
            <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <Gamepad2 className="w-7 h-7 text-violet-500" />
                    Tendencias en la Comunidad
                </h2>
                
                {cargando ? (
                    <div className="text-slate-500 animate-pulse font-medium py-10">Buscando portadas...</div>
                ) : juegosRecientes.length === 0 ? (
                    <div className="text-slate-500 text-sm py-10 bg-slate-900 rounded-xl border border-slate-800 text-center">Aún no hay suficientes datos para mostrar tendencias.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                        {juegosRecientes.map((juego) => (
                            <div 
                                key={juego.id} 
                                className="group relative h-52 rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-all duration-300"
                                onClick={() => navigate(`/app/foros/juego/${juego.id}`)}
                            >
                                {juego.background_image ? (
                                    <img 
                                        src={juego.background_image} 
                                        alt={juego.name} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                        <Gamepad2 className="w-14 h-14 text-slate-700" />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/70 to-slate-950/10"></div>
                                
                                <div className="absolute bottom-0 left-0 p-5 w-full">
                                    <h3 className="text-white font-black text-xl leading-snug line-clamp-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                        {juego.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOROS RECIENTES */}
            <div className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <MessageSquareReply className="w-7 h-7 text-violet-500" />
                    Foros Recientes
                </h2>
                
                {cargando ? (
                    <div className="text-slate-500 animate-pulse font-medium py-10">Cargando actividad...</div>
                ) : forosRecientes.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-700 rounded-xl text-slate-500">
                        <Gamepad2 className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                        <p className="font-bold text-lg text-slate-400 mb-1">Aún no hay ningún foro creado.</p>
                        <p className="text-slate-600">¡Sé el primero en abrir un debate!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        {forosRecientes.map((foro) => (
                            <div 
                                key={foro.id} 
                                className="group relative h-44 rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all duration-300 flex flex-col"
                                onClick={() => navigate(`/app/foro/${foro.id}`)}
                            >
                                {foro.imagen_juego ? (
                                    <img 
                                        src={foro.imagen_juego} 
                                        alt={foro.videojuegos?.nombre} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                        <Gamepad2 className="w-12 h-12 text-slate-700" />
                                    </div>
                                )}


                                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-slate-950/20"></div>

                                <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-violet-400 mb-1.5 block drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
                                        {foro.categorias?.nombre || 'General'}
                                    </span>
                                    <h3 className="text-slate-50 font-extrabold text-xl leading-snug line-clamp-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" title={foro.titulo}>
                                        {foro.titulo}
                                    </h3>
                                    <p className="text-slate-200 font-bold text-sm mt-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] flex items-center gap-2">
                                        {foro.videojuegos?.nombre || 'Juego Desconocido'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}