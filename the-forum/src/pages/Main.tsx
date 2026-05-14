import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { MessageSquare, PlusCircle, Search, X } from 'lucide-react'
import type { Categoria } from '@/types'
import { rawgApi, type JuegoBuscador } from '@/lib/rawg'

export default function Main() {
    const user = useAuthStore((state) => state.user)

    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [cargando, setCargando] = useState(true)

    // Estados del Modal y el Formulario
    const [modalAbierto, setModalAbierto] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [resultadosJuegos, setResultadosJuegos] = useState<JuegoBuscador[]>([])
    const [buscandoJuegos, setBuscandoJuegos] = useState(false)

    const [juegoSeleccionado, setJuegoSeleccionado] = useState<JuegoBuscador | null>(null)
    const [tituloForo, setTituloForo] = useState('')
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | ''>('')
    const [creandoForo, setCreandoForo] = useState(false)

    const [forosRecientes, setForosRecientes] = useState<any[]>([])

    // Funcion para Cargar datos
    const cargarDatosDashboard = async () => {
        try {
            // 1. Cargamos categorías
            const { data: dataCat, error: errCat } = await supabase.from('categorias').select('*').order('nombre')
            if (errCat) throw errCat
            if (dataCat) setCategorias(dataCat)

            // 2. Cargamos los últimos foros creados
            const { data: dataForos, error: errForos } = await supabase
                .from('foros')
                .select(`*, videojuegos (*), categorias (*)`)
                .order('created_at', { ascending: false })
                .limit(6)

            if (errForos) throw errForos
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


    // Buscador RAWG (Debounce)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (busqueda.length >= 3) {
                setBuscandoJuegos(true)
                const resultados = await rawgApi.buscarJuegos(busqueda)
                setResultadosJuegos(resultados)
                setBuscandoJuegos(false)
            } else {
                setResultadosJuegos([])
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [busqueda])

    // Función para guardar en base de datos
    const handleCrearForo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!juegoSeleccionado || !user || !categoriaSeleccionada) return

        setCreandoForo(true)

        try {
            // 1. Comprobar/Insertar Juego en Supabase
            const { data: juegoExistente } = await supabase.from('videojuegos').select('id').eq('id', juegoSeleccionado.id).single()

            if (!juegoExistente) {
                const { error: errorInsertar } = await supabase.from('videojuegos').insert({
                    id: juegoSeleccionado.id,
                    nombre: juegoSeleccionado.name,
                    fecha_salida: juegoSeleccionado.released || null,
                })
                if (errorInsertar) {
                    console.error("Detalle del error de Supabase al guardar juego:", errorInsertar);
                    throw new Error('Error al guardar el videojuego');
                }
            }

            // 2. Crear el Foro
            const { error: errorForo } = await supabase.from('foros').insert({
                titulo: tituloForo,
                videojuego_id: juegoSeleccionado.id,
                categoria_id: Number(categoriaSeleccionada),
                creador_id: user.id,
                esta_abierto: true
            })

            if (errorForo) throw new Error('Error al crear el foro')

            // 3. Éxito: Limpiar form y cerrar modal
            setJuegoSeleccionado(null)
            setTituloForo('')
            setCategoriaSeleccionada('')
            setBusqueda('')
            setModalAbierto(false) // Cerramos el modal
            alert("¡Foro creado con éxito!") // Temporal hasta que pongamos tostadas bonitas

        } catch (error) {
            console.error(error)
            alert('Hubo un error al crear el foro.')
        } finally {
            cargarDatosDashboard()
            setCreandoForo(false)
        }
    }

    // Función para resetear el formulario si el usuario cierra el modal a medias
    const handleCambioModal = (abierto: boolean) => {
        setModalAbierto(abierto)
        if (!abierto) {
            setBusqueda('')
            setResultadosJuegos([])
            setJuegoSeleccionado(null)
            setTituloForo('')
            setCategoriaSeleccionada('')
        }
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">

            {/* CABECERA CON BOTÓN A LA DERECHA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Panel Principal</h1>
                    <p className="text-gray-500 mt-2">
                        Bienvenido de nuevo, <span className="font-medium text-blue-600">{user?.email}</span>
                    </p>
                </div>

                {/* MODAL / DIALOG */}
                <Dialog open={modalAbierto} onOpenChange={handleCambioModal}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Crear Nuevo Foro
                        </Button>
                    </DialogTrigger>

                    {/* Contenido del Modal */}
                    <DialogContent className="sm:max-w-137.5">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Crear un nuevo foro</DialogTitle>
                            <DialogDescription>
                                Rellena los detalles para abrir un nuevo espacio de debate en la comunidad.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCrearForo} className="space-y-6 mt-4">

                            {/* 1. Nombre del Foro */}
                            <div className="space-y-2">
                                <Label htmlFor="titulo" className="text-gray-700 font-semibold">Título del Foro</Label>
                                <Input
                                    id="titulo"
                                    placeholder="Ej. Dudas de principiantes, Busco equipo..."
                                    value={tituloForo}
                                    onChange={(e) => setTituloForo(e.target.value)}
                                    required
                                />
                            </div>

                            {/* 2. Categoría */}
                            <div className="space-y-2">
                                <Label htmlFor="categoria" className="text-gray-700 font-semibold">Categoría</Label>
                                <select
                                    id="categoria"
                                    value={categoriaSeleccionada}
                                    onChange={(e) => setCategoriaSeleccionada(e.target.value as unknown as number)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="" disabled>Selecciona una categoría...</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Selección de Videojuego */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-semibold">Videojuego</Label>

                                {juegoSeleccionado ? (
                                    // Si hay juego seleccionado, lo mostramos con opción a quitarlo
                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <img src={juegoSeleccionado.background_image || 'https://via.placeholder.com/150'} alt={juegoSeleccionado.name} className="w-10 h-10 object-cover rounded shadow-sm" />
                                            <span className="font-medium text-blue-900">{juegoSeleccionado.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setJuegoSeleccionado(null)} type="button" className="text-gray-500 hover:text-red-600">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    // Si no hay juego, mostramos el buscador
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Busca el videojuego... (Ej. Elden Ring)"
                                            className="pl-10"
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                        />

                                        {/* Resultados de la búsqueda */}
                                        {buscandoJuegos && <div className="absolute w-full mt-1 p-2 bg-white border rounded shadow-md text-sm text-center z-50">Buscando...</div>}

                                        {resultadosJuegos.length > 0 && !buscandoJuegos && (
                                            <div className="absolute w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto z-50">
                                                {resultadosJuegos.map((juego) => (
                                                    <div
                                                        key={juego.id}
                                                        className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                                        onClick={() => {
                                                            setJuegoSeleccionado(juego)
                                                            setResultadosJuegos([])
                                                            setBusqueda('')
                                                        }}
                                                    >
                                                        <img src={juego.background_image || 'https://via.placeholder.com/150'} className="w-8 h-8 object-cover rounded" />
                                                        <span className="text-sm font-medium">{juego.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Botón Guardar */}
                            <Button type="submit" className="w-full" disabled={creandoForo || !juegoSeleccionado}>
                                {creandoForo ? 'Creando foro...' : 'Confirmar y Crear Foro'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            {/* NUEVA SECCIÓN: ÚLTIMOS FOROS */}
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
                        {forosRecientes.map((foro) => {
                            // Hacemos una llamada rápida a la API de RAWG (opcional, pero queda genial) 
                            // O simplemente usamos un diseño elegante con los textos si no queremos saturar RAWG.
                            // Como de momento guardamos poca info del juego, lo mostramos limpio:
                            return (
                                <Card key={foro.id} className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
                                    {/* Cabecera de color/imagen decorativa */}
                                    <div className="h-16 bg-linear-to-r from-blue-600 to-indigo-700"></div>

                                    <CardHeader className="-mt-10 relative pb-2">
                                        {/* Insignia de la categoría */}
                                        <div className="absolute top-0 right-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-700 shadow-sm border border-gray-100">
                                            {foro.categorias?.nombre || 'General'}
                                        </div>

                                        <CardTitle className="text-xl pt-4 line-clamp-1" title={foro.titulo}>
                                            {foro.titulo}
                                        </CardTitle>
                                        <CardDescription className="font-medium text-gray-900 mt-1">
                                            🎮 {foro.videojuegos?.nombre || 'Juego Desconocido'}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>



            {/* SECCIÓN: CATEGORÍAS (Tu dashboard limpio) */}
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


