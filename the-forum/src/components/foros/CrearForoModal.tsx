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
  juegoInicial?: JuegoBuscador | null; 
  onCreado?: () => void; 
}

export function CrearForoModal({ juegoInicial, onCreado }: CrearForoModalProps) {
  const user = useAuthStore((state) => state.user)
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  
  const [busqueda, setBusqueda] = useState('')
  const [resultadosJuegos, setResultadosJuegos] = useState<JuegoBuscador[]>([])
  const [buscandoJuegos, setBuscandoJuegos] = useState(false)
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<JuegoBuscador | null>(null)
  
  const [tituloForo, setTituloForo] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | ''>('')
  const [creandoForo, setCreandoForo] = useState(false)

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
      const { data: juegoExistente } = await supabase.from('videojuegos').select('id').eq('id', juegoSeleccionado.id).single()

      if (!juegoExistente) {
        await supabase.from('videojuegos').insert({
          id: juegoSeleccionado.id,
          nombre: juegoSeleccionado.name,
          fecha_salida: juegoSeleccionado.released || null,
        })
      }

      const { error: errorForo } = await supabase.from('foros').insert({
        titulo: tituloForo,
        videojuego_id: juegoSeleccionado.id,
        categoria_id: Number(categoriaSeleccionada),
        creador_id: user.id,
        esta_abierto: true
      })

      if (errorForo) throw errorForo

      setModalAbierto(false)
      setTituloForo('')
      setCategoriaSeleccionada('')
      if (!juegoInicial) setJuegoSeleccionado(null) 
      
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
        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all">
          <PlusCircle className="mr-2 h-5 w-5" />
          Crear Nuevo Foro
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-137.5 bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">Crear un nuevo foro</DialogTitle>
          <DialogDescription className="text-slate-400">
            Rellena los detalles para abrir un nuevo espacio de debate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCrearForo} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="titulo" className="text-slate-300 font-semibold">Título del Foro</Label>
            <Input 
              id="titulo" 
              placeholder="Ej. Dudas de principiantes..." 
              value={tituloForo} 
              onChange={(e) => setTituloForo(e.target.value)} 
              required 
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-slate-300 font-semibold">Categoría</Label>
            <select 
              id="categoria" 
              value={categoriaSeleccionada} 
              onChange={(e) => setCategoriaSeleccionada(e.target.value as unknown as number)} 
              required 
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="" disabled className="text-slate-500">Selecciona una categoría...</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Videojuego</Label>
            {juegoSeleccionado ? (
              <div className="flex items-center justify-between p-3 bg-violet-900/20 border border-violet-500/30 rounded-md">
                <div className="flex items-center gap-3">
                  <img src={juegoSeleccionado.background_image || 'https://via.placeholder.com/150'} alt={juegoSeleccionado.name} className="w-10 h-10 object-cover rounded shadow-sm border border-slate-700"/>
                  <span className="font-bold text-violet-200">{juegoSeleccionado.name}</span>
                </div>
                {!juegoInicial && (
                  <Button variant="ghost" size="icon" onClick={() => setJuegoSeleccionado(null)} type="button" className="text-slate-400 hover:text-red-400 hover:bg-slate-900/50">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Busca el videojuego... (Ej. Elden Ring)" 
                  className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500" 
                  value={busqueda} 
                  onChange={(e) => setBusqueda(e.target.value)} 
                />
                
                {buscandoJuegos && (
                  <div className="absolute w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-md shadow-xl text-sm text-center text-slate-300 z-50">
                    Buscando...
                  </div>
                )}
                
                {resultadosJuegos.length > 0 && !buscandoJuegos && (
                  <div className="absolute w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-2xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-700">
                    {resultadosJuegos.map((juego) => (
                      <div 
                        key={juego.id} 
                        className="flex items-center gap-3 p-2 hover:bg-slate-700 cursor-pointer transition-colors" 
                        onClick={() => { setJuegoSeleccionado(juego); setResultadosJuegos([]); setBusqueda(''); }}
                      >
                        <img src={juego.background_image || 'https://via.placeholder.com/150'} className="w-8 h-8 object-cover rounded"/>
                        <span className="text-sm font-medium text-slate-200">{juego.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-11" disabled={creandoForo || !juegoSeleccionado}>
            {creandoForo ? 'Creando foro...' : 'Confirmar y Crear Foro'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}