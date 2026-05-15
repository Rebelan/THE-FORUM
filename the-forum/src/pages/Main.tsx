import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { Categoria } from '@/types'
import { CrearForoModal } from '@/components/foros/CrearForoModal'
import { MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'


export default function Main() {

    const navigate = useNavigate()

    const user = useAuthStore((state) => state.user)

    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [cargando, setCargando] = useState(true)
    const [forosRecientes, setForosRecientes] = useState<any[]>([])

    const cargarDatosDashboard = async () => {
        try {
            const { data: dataCat } = await supabase.from('categorias').select('*').order('nombre')
            if (dataCat) setCategorias(dataCat)

            const { data: dataForos } = await supabase
                .from('foros')
                .select(`*, videojuegos (*), categorias (*)`)
                .order('created_at', { ascending: false })
                .limit(6)
            if (dataForos) setForosRecientes(dataForos)

        } catch (error) {
            console.error("Error al cargar datos:", error)
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarDatosDashboard()
    }, [])

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">

            {/* CABECERA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Panel Principal</h1>
                    <p className="text-gray-500 mt-2">Bienvenido de nuevo, <span className="font-medium text-blue-600">{user?.email}</span></p>
                </div>

               
                <CrearForoModal onCreado={cargarDatosDashboard} />
            </div>

            {/* SECCIÓN: FOROS RECIENTES */}
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

            {/* SECCIÓN: CATEGORÍAS */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Categorías de la Comunidad</h2>
                {cargando ? (
                    <div className="text-gray-500 animate-pulse font-medium">Sincronizando con la base de datos...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categorias.map((categoria) => (
                            <Card key={categoria.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-600 hover:-translate-y-1 duration-200">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <CardTitle className="text-xl">{categoria.nombre}</CardTitle>
                                    </div>
                                    <CardDescription className="mt-3 text-sm text-gray-600 line-clamp-2">
                                        {categoria.descripcion}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}