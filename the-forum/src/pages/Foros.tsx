import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rawgApi, type JuegoBuscador } from '@/lib/rawg'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Gamepad2 } from 'lucide-react'

export default function Foros() {
  const navigate = useNavigate()
  const [juegos, setJuegos] = useState<JuegoBuscador[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  // 1. Cargar juegos populares al entrar a la página
  useEffect(() => {
    async function cargarPopulares() {
      setCargando(true)
      const populares = await rawgApi.getJuegosPopulares()
      setJuegos(populares)
      setCargando(false)
    }
    cargarPopulares()
  }, [])

  // 2. Buscador en vivo (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busqueda.length >= 3) {
        setCargando(true)
        const resultados = await rawgApi.buscarJuegos(busqueda)
        // Sobrescribimos la lista de populares con los resultados de búsqueda
        setJuegos(resultados)
        setCargando(false)
      } else if (busqueda.length === 0) {
        // Si borra la búsqueda, volvemos a cargar los populares
        setCargando(true)
        const populares = await rawgApi.getJuegosPopulares()
        setJuegos(populares)
        setCargando(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [busqueda])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Directorio de Juegos</h1>
          <p className="text-gray-500 mt-2">
            Selecciona un videojuego para ver sus foros o crea uno nuevo.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Buscar videojuego..." 
            className="pl-10 h-12 text-md shadow-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* CUADRÍCULA DE JUEGOS */}
      {cargando ? (
        <div className="flex justify-center py-20 text-gray-500 animate-pulse">
          Cargando biblioteca de juegos...
        </div>
      ) : juegos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No se han encontrado juegos con ese nombre.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {juegos.map((juego) => (
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
                {/* Degradado negro en la parte inferior para que se lea el texto */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                    {juego.name}
                  </h3>
                  <p className="text-gray-300 text-xs mt-1">
                    {juego.released ? new Date(juego.released).getFullYear() : 'TBA'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}