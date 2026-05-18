import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { rawgApi } from '@/lib/rawg'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    const [username, setUsername] = useState<string>('') // NUEVO ESTADO PARA EL USERNAME

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
                setForosRecientes(dataForos.slice(0, 6))

                const idsJuegosUnicos = Array.from(new Set(dataForos.map(f => f.videojuego_id).filter(Boolean)))
                const topIdsJuegos = idsJuegosUnicos.slice(0, 4)

                const juegosConPortada = await Promise.all(
                    topIdsJuegos.map(async (id) => {
                        try {
                            return await rawgApi.getJuegoDetalle(id.toString())
                        } catch (e) {
                            const foroRef = dataForos.find(f => f.videojuego_id === id)
                            return { id, name: foroRef?.videojuegos?.nombre || 'Desconocido', background_image: null }
                        }
                    })
                )
                setJuegosRecientes(juegosConPortada.filter(Boolean))
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
                    <p className="text-gray-500 mt-2">Bienvenido de nuevo, <span className="font-medium text-blue-600">{username || user?.email}</span></p>
                </div>


                <div className="flex items-center gap-4">
                    <CampanaNotificaciones /> 
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                    <CrearForoModal onCreado={cargarDatosDashboard} />
                </div>
            </div>

            {/* JUEGOS CON ACTIVIDAD RECIENTE */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Tendencias en la Comunidad</h2>
                {cargando ? (
                    <div className="text-gray-500 animate-pulse font-medium">Buscando portadas...</div>
                ) : juegosRecientes.length === 0 ? (
                    <div className="text-gray-500 text-sm">Aún no hay suficientes datos para mostrar tendencias.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {juegosRecientes.map((juego) => (
                            <Card 
                                key={juego.id} 
                                className="group cursor-pointer overflow-hidden border-transparent shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                onClick={() => navigate(`/app/foros/juego/${juego.id}`)}
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                                    {juego.background_image ? (
                                        <img 
                                            src={juego.background_image} 
                                            alt={juego.name} 
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Gamepad2 className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                                    
                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                                            {juego.name}
                                        </h3>
                                    </div>
                                </div>
                            </Card>
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
                            <Card 
                            key={foro.id} 
                            className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col"
                            onClick={() =>navigate(`/app/foro/${foro.id}`)}
                            >
                                <div className="h-16 bg-linear-to-r from-blue-600 to-indigo-700"></div>
                                <CardHeader className="-mt-10 relative pb-2">
                                    <div className="absolute top-0 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm border border-gray-100">
                                        {foro.categorias?.nombre || 'General'}
                                    </div>
                                    <CardTitle className="text-xl pt-4 line-clamp-1" title={foro.titulo}>{foro.titulo}</CardTitle>
                                    <CardDescription className="font-medium text-gray-900 mt-1">🎮 {foro.videojuegos?.nombre || 'Juego Desconocido'}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}