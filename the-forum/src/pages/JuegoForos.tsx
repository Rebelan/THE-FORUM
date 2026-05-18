import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { rawgApi } from '@/lib/rawg'
import { useAuthStore } from '@/store/authStore' 
import type { Categoria } from '@/types'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft, MessageSquare, Lock, Unlock } from 'lucide-react' 
import { CrearForoModal } from '@/components/foros/CrearForoModal'

export default function JuegoForos() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user) 

    const [juego, setJuego] = useState<any>(null)
    const [foros, setForos] = useState<any[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [cargando, setCargando] = useState(true)
    const [rolUsuario, setRolUsuario] = useState<number>(3) 

    const [filtroTexto, setFiltroTexto] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

    const recargarForos = async () => {
        if (!id) return
        const { data: dataForos } = await supabase
            .from('foros')
            .select('*, categorias(*)')
            .eq('videojuego_id', id)
            .order('created_at', { ascending: false })
        
        if (dataForos) setForos(dataForos)
    }

    useEffect(() => {
        async function cargarDatos() {
            if (!id) return
            setCargando(true)

            try {
                if (user) {
                    const { data: perfil } = await supabase.from('usuarios').select('rol_id').eq('id', user.id).single()
                    if (perfil) setRolUsuario(perfil.rol_id)
                }

                const datosJuego = await rawgApi.getJuegoDetalle(id)
                setJuego(datosJuego)

                const { data: dataCat } = await supabase.from('categorias').select('*').order('nombre')
                if (dataCat) setCategorias(dataCat)

                const { data: dataForos } = await supabase
                    .from('foros')
                    .select('*, categorias(*)')
                    .eq('videojuego_id', id)
                    .order('created_at', { ascending: false })

                if (dataForos) setForos(dataForos)

            } catch (error) {
                console.error("Error al cargar la página del juego:", error)
            } finally {
                setCargando(false)
            }
        }

        cargarDatos()
    }, [id, user])

    const handleToggleCerrado = async (e: React.MouseEvent, foroId: string, titulo: string, estadoActual: boolean) => {
        e.stopPropagation() // Evita que el clic abra la tarjeta y te mande al foro
        
        const accion = estadoActual ? 'reabrir' : 'cerrar'
        if (!window.confirm(`¿Seguro que quieres ${accion} el foro "${titulo}"?`)) return

        try {
            const { error } = await supabase.from('foros').update({ cerrado: !estadoActual }).eq('id', foroId)
            if (error) throw error
            await recargarForos()
        } catch (error) {
            console.error(error)
            alert("Error al cambiar el estado del foro")
        }
    }

    const forosFiltrados = foros.filter(foro => {
        const coincideTexto = foro.titulo.toLowerCase().includes(filtroTexto.toLowerCase())
        const coincideCategoria = filtroCategoria === 'todas' || foro.categoria_id.toString() === filtroCategoria
        return coincideTexto && coincideCategoria
    })

    if (cargando) {
        return <div className="p-8 text-center animate-pulse text-gray-500">Cargando comunidad...</div>
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="relative h-64 w-full bg-gray-900">
                {juego?.background_image && (
                    <img src={juego.background_image} alt={juego.name} className="w-full h-full object-cover opacity-40" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-gray-50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 max-w-6xl mx-auto">
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/foros')} className="mb-4 bg-white/80 hover:bg-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al directorio
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-sm">
                        {juego?.name || 'Comunidad'}
                    </h1>
                </div>
            </div>

            <div className="p-8 max-w-6xl mx-auto space-y-8 -mt-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar un foro por título..."
                            className="pl-10"
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                        />
                    </div>

                    <select
                        className="flex h-10 w-full md:w-64 rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background"
                        value={filtroCategoria}
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                        <option value="todas">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>

                    <div className="w-full md:w-auto">
                        <CrearForoModal juegoInicial={juego} onCreado={() => recargarForos()} />
                    </div>
                </div>

                <div>
                    {forosFiltrados.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No hay foros aquí</h3>
                            <p className="text-gray-500 mt-1">
                                {foros.length === 0 ? "¡Crea tú uno!" : "Ningún foro coincide con tus filtros."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {forosFiltrados.map((foro) => (
                                <Card
                                    key={foro.id}
                                    className={`hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group ${foro.cerrado ? 'bg-slate-50 opacity-90' : ''}`}
                                    onClick={() => navigate(`/app/foro/${foro.id}`)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">
                                                    {foro.categorias?.nombre}
                                                </span>
                                                <CardTitle className={`text-xl group-hover:text-blue-700 transition-colors flex flex-wrap items-center gap-2 ${foro.cerrado ? 'text-gray-600' : ''}`}>
                                                    {foro.titulo}
                                                    {/* ETIQUETA VISUAL SI ESTÁ CERRADO */}
                                                    {foro.cerrado && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                                                            <Lock className="w-3 h-3" /> Cerrado
                                                        </span>
                                                    )}
                                                </CardTitle>
                                            </div>
                                            
                                            {/* BOTÓN DE MODERACIÓN (Solo rol 1 o 2) */}
                                            {(rolUsuario === 1 || rolUsuario === 2) && (
                                                <Button
                                                    variant={foro.cerrado ? "outline" : "destructive"}
                                                    size="icon"
                                                    className="shrink-0"
                                                    onClick={(e) => handleToggleCerrado(e, foro.id, foro.titulo, foro.cerrado)}
                                                    title={foro.cerrado ? "Reabrir foro" : "Cerrar foro"}
                                                >
                                                    {foro.cerrado ? <Unlock className="w-4 h-4 text-gray-600" /> : <Lock className="w-4 h-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}