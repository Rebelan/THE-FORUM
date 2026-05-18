import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rawgApi, type JuegoBuscador } from '@/lib/rawg'
import { Input } from '@/components/ui/input'
import { Search, Gamepad2 } from 'lucide-react'

export default function Foros() {
  const navigate = useNavigate()
  const [juegos, setJuegos] = useState<JuegoBuscador[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    async function cargarPopulares() {
      setCargando(true)
      const populares = await rawgApi.getJuegosPopulares()
      setJuegos(populares)
      setCargando(false)
    }
    cargarPopulares()
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busqueda.length >= 3) {
        setCargando(true)
        const resultados = await rawgApi.buscarJuegos(busqueda)
        setJuegos(resultados)
        setCargando(false)
      } else if (busqueda.length === 0) {
        setCargando(true)
        const populares = await rawgApi.getJuegosPopulares()
        setJuegos(populares)
        setCargando(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [busqueda])

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 bg-background text-foreground min-h-screen">
      
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Directorio de Juegos</h1>
          <p className="text-slate-400 mt-2 text-md font-medium">
            Selecciona un videojuego para ver sus foros o crea uno nuevo.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
          <Input 
            placeholder="Buscar videojuego..." 
            className="pl-10 h-12 text-md bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-violet-500 shadow-inner"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* CUADRÍCULA DE JUEGOS */}
      {cargando ? (
        <div className="flex justify-center py-20 text-slate-500 animate-pulse font-medium">
          Cargando biblioteca de juegos...
        </div>
      ) : juegos.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium bg-slate-900/50 rounded-xl border border-slate-800">
          No se han encontrado juegos con ese nombre.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {juegos.map((juego) => (
            <div 
              key={juego.id} 
              className="group relative h-52 rounded-2xl overflow-hidden cursor-pointer border-2 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-all duration-300"
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
                  <Gamepad2 className="w-12 h-12 text-slate-700" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 p-4 w-full flex flex-col justify-end">
                <h3 className="text-white font-black text-lg leading-tight line-clamp-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {juego.name}
                </h3>
                <p className="text-slate-300 text-xs font-bold mt-1.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] flex items-center gap-1">
                  {juego.released ? new Date(juego.released).getFullYear() : 'TBA'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}