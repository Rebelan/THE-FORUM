import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { rawgApi } from '@/lib/rawg'
import { CrearForoModal } from '@/components/foros/CrearForoModal'
import { Gamepad2 } from 'lucide-react'
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
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">

            {/* CABECERA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Panel Principal</h1>
                    <p className="text-gray-500 mt-2">Bienvenido de nuevo, <span className="font-bold text-violet-600">{username || user?.email}</span></p>
                </div>

                <div className="flex items-center gap-4">
                    <CampanaNotificaciones /> 
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                    <CrearForoModal onCreado={cargarDatosDashboard} />
                </div>
            </div>

            {/* JUEGOS CON ACTIVIDAD RECIENTE (TENDENCIAS) */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Tendencias en la Comunidad</h2>
                {cargando ? (
                    <div className="text-gray-500 animate-pulse font-medium">Buscando portadas...</div>
                ) : juegosRecientes.length === 0 ? (
                    <div className="text-gray-500 text-sm">Aún no hay suficientes datos para mostrar tendencias.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {juegosRecientes.map((juego) => (
                            <div 
                                key={juego.id} 
                                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer border-2 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300"
                                onClick={() => navigate(`/app/foros/juego/${juego.id}`)}
                            >
                                {juego.background_image ? (
                                    <img 
                                        src={juego.background_image} 
                                        alt={juego.name} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                        <Gamepad2 className="w-12 h-12 text-slate-700" />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
                                
                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
                                        {juego.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOROS RECIENTES */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Foros Recientes</h2>
                {cargando ? (
                    <div className="text-gray-500 animate-pulse font-medium">Cargando actividad...</div>
                ) : forosRecientes.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                        Aún no hay ningún foro creado. ¡Sé el primero en abrir uno!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forosRecientes.map((foro) => (
                            <div 
                                key={foro.id} 
                                className="group relative h-40 rounded-xl overflow-hidden cursor-pointer border-2 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 flex flex-col"
                                onClick={() => navigate(`/app/foro/${foro.id}`)}
                            >
                                
                                {foro.imagen_juego ? (
                                    <img 
                                        src={foro.imagen_juego} 
                                        alt={foro.videojuegos?.nombre} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                        <Gamepad2 className="w-10 h-10 text-slate-700" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/70 to-slate-900/20"></div>

                                <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 mb-1 block drop-shadow-md">
                                        {foro.categorias?.nombre || 'General'}
                                    </span>
                                    <h3 className="text-slate-50 font-bold text-lg leading-tight line-clamp-1 drop-shadow-md" title={foro.titulo}>
                                        {foro.titulo}
                                    </h3>
                                    <p className="text-slate-200 font-bold text-sm mt-1.5 drop-shadow-md flex items-center gap-1.5">
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