import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog'
import { PlusCircle, Search, X } from 'lucide-react'
import type { Categoria } from '@/types'
import { rawgApi, type JuegoBuscador } from '@/lib/rawg'

interface CrearForoModalProps {
  juegoInicial?: JuegoBuscador | null; // Si se lo pasamos, ya viene el juego relleno
  onCreado?: () => void; // Función para avisar al padre de que recargue los datos
}

export function CrearForoModal({ juegoInicial, onCreado }: CrearForoModalProps) {
  const user = useAuthStore((state) => state.user)
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  
  // Estados del formulario
  const [busqueda, setBusqueda] = useState('')
  const [resultadosJuegos, setResultadosJuegos] = useState<JuegoBuscador[]>([])
  const [buscandoJuegos, setBuscandoJuegos] = useState(false)
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<JuegoBuscador | null>(null)
  
  const [tituloForo, setTituloForo] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | ''>('')
  const [creandoForo, setCreandoForo] = useState(false)

  // Cargar categorías y establecer juego inicial si existe
  useEffect(() => {
    supabase.from('categorias').select('*').order('nombre').then(({ data }) => {
      if (data) setCategorias(data)
    })
  }, [])

  useEffect(() => {
    if (juegoInicial) {
      setJuegoSeleccionado(juegoInicial)
    }
  }, [juegoInicial])

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

  const handleCrearForo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!juegoSeleccionado || !user || !categoriaSeleccionada) return

    setCreandoForo(true)

    try {
      // 1. Guardar/Comprobar juego
      const { data: juegoExistente } = await supabase.from('videojuegos').select('id').eq('id', juegoSeleccionado.id).single()

      if (!juegoExistente) {
        await supabase.from('videojuegos').insert({
          id: juegoSeleccionado.id,
          nombre: juegoSeleccionado.name,
          fecha_salida: juegoSeleccionado.released || null,
        })
      }

      // 2. Crear foro
      const { error: errorForo } = await supabase.from('foros').insert({
        titulo: tituloForo,
        videojuego_id: juegoSeleccionado.id,
        categoria_id: Number(categoriaSeleccionada),
        creador_id: user.id,
        esta_abierto: true
      })

      if (errorForo) throw errorForo

      // 3. Éxito
      setModalAbierto(false)
      setTituloForo('')
      setCategoriaSeleccionada('')
      if (!juegoInicial) setJuegoSeleccionado(null) // Solo reseteamos el juego si no venía fijado
      
      // Avisamos al componente padre de que recargue sus datos
      if (onCreado) onCreado()

    } catch (error) {
      console.error(error)
    } finally {
      setCreandoForo(false)
    }
  }

  const handleCambioModal = (abierto: boolean) => {
    setModalAbierto(abierto)
    if (!abierto) {
      setBusqueda('')
      setResultadosJuegos([])
      setTituloForo('')
      setCategoriaSeleccionada('')
      if (!juegoInicial) setJuegoSeleccionado(null)
    }
  }

  return (
    <Dialog open={modalAbierto} onOpenChange={handleCambioModal}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" />
          Crear Nuevo Foro
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle className="text-2xl">Crear un nuevo foro</DialogTitle>
          <DialogDescription>
            Rellena los detalles para abrir un nuevo espacio de debate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCrearForo} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-gray-700 font-semibold">Título del Foro</Label>
            <Input id="titulo" placeholder="Ej. Dudas de principiantes..." value={tituloForo} onChange={(e) => setTituloForo(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-gray-700 font-semibold">Categoría</Label>
            <select id="categoria" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value as unknown as number)} required className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
              <option value="" disabled>Selecciona una categoría...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Videojuego</Label>
            {juegoSeleccionado ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-3">
                  <img src={juegoSeleccionado.background_image || 'https://via.placeholder.com/150'} alt={juegoSeleccionado.name} className="w-10 h-10 object-cover rounded shadow-sm"/>
                  <span className="font-medium text-blue-900">{juegoSeleccionado.name}</span>
                </div>
                {/* Si vino como juegoInicial, no dejamos quitarlo para no romper el flujo */}
                {!juegoInicial && (
                  <Button variant="ghost" size="icon" onClick={() => setJuegoSeleccionado(null)} type="button" className="text-gray-500 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Busca el videojuego... (Ej. Elden Ring)" className="pl-10" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                {buscandoJuegos && <div className="absolute w-full mt-1 p-2 bg-white border rounded shadow-md text-sm text-center z-50">Buscando...</div>}
                {resultadosJuegos.length > 0 && !buscandoJuegos && (
                  <div className="absolute w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto z-50">
                    {resultadosJuegos.map((juego) => (
                      <div key={juego.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0" onClick={() => { setJuegoSeleccionado(juego); setResultadosJuegos([]); setBusqueda(''); }}>
                        <img src={juego.background_image || 'https://via.placeholder.com/150'} className="w-8 h-8 object-cover rounded"/>
                        <span className="text-sm font-medium">{juego.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={creandoForo || !juegoSeleccionado}>
            {creandoForo ? 'Creando foro...' : 'Confirmar y Crear Foro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}