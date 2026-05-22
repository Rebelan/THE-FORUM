import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { MessageSquare, Lock, Unlock, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Categoria } from '@/types' 

export default function ForosUsuario() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const [foros, setForos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [rolUsuario, setRolUsuario] = useState<number>(3)

  // ESTADOS PARA LOS FILTROS
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  const [dialogoCierre, setDialogoCierre] = useState<{open: boolean, id: string, titulo: string, cerrar: boolean}>({
    open: false, id: '', titulo: '', cerrar: true
  })

  const cargarMisForos = async () => {
    if (!user) return
    setCargando(true)
    try {
      const { data: perfil } = await supabase.from('usuarios').select('rol_id').eq('id', user.id).single()
      if (perfil) setRolUsuario(perfil.rol_id)

      const { data: dataCat } = await supabase.from('categorias').select('*').order('nombre')
      if (dataCat) setCategorias(dataCat)

      const { data } = await supabase
        .from('foros')
        .select('*, categorias(*), videojuegos(*)')
        .eq('creador_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setForos(data)
    } catch (error) {
      console.error("Error al cargar tus foros:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleToggleCerradoConfirm = async () => {
    try {
      const { error } = await supabase.from('foros').update({ cerrado: dialogoCierre.cerrar }).eq('id', dialogoCierre.id)
      if (error) throw error
      await cargarMisForos()
    } catch (error) {
      console.error(error)
    }
    setDialogoCierre({open: false, id: '', titulo: '', cerrar: true})
  }

  useEffect(() => {
    cargarMisForos()
  }, [user])

  // LÓGICA DE FILTRADO
  const forosFiltrados = foros.filter(foro => {
    const coincideTexto = foro.titulo.toLowerCase().includes(filtroTexto.toLowerCase())
    const coincideCategoria = filtroCategoria === 'todas' || foro.categoria_id?.toString() === filtroCategoria
    return coincideTexto && coincideCategoria
  })

  if (cargando) return <div className="p-8 pt-24 text-center text-slate-500 font-medium animate-pulse min-h-screen bg-background">Cargando tus debates...</div>

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-4 md:p-8 pt-20 md:pt-8 space-y-8 animate-in fade-in duration-500">
        
        {/* CABECERA */}
        <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="p-3 bg-violet-900/30 text-violet-400 rounded-xl border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0">
            <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Mis Foros</h1>
            <p className="text-slate-400 font-medium text-sm md:text-base">Listado de todos los debates que has abierto en la comunidad</p>
          </div>
        </div>

        {foros.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-5 rounded-2xl shadow-xl border border-slate-800 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar en tus foros por título..."
                className="pl-10 h-11 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>

            <select
              className="flex h-11 w-full md:w-64 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* LISTADO DE FOROS */}
        <div>
          {foros.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 space-y-4">
              <MessageSquare className="w-14 h-14 text-slate-700 mx-auto opacity-40" />
              <h3 className="text-xl font-bold text-slate-300">Aún no has creado ningún foro</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm">
                ¡Explora el directorio de videojuegos y abre tu primer hilo de discusión!
              </p>
              <Button onClick={() => navigate('/app/foros')} className="bg-violet-600 hover:bg-violet-700 text-white font-bold mt-2">
                Ir al Directorio
              </Button>
            </div>
          ) : forosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
              <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300">Sin resultados</h3>
              <p className="text-slate-500 mt-2 font-medium">
                Ninguno de tus foros coincide con los filtros actuales.
              </p>
              <Button variant="outline" onClick={() => {setFiltroTexto(''); setFiltroCategoria('todas')}} className="mt-4 border-slate-700 text-slate-300 hover:text-white">
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {forosFiltrados.map((foro) => (
                <div
                  key={foro.id}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col justify-between ${
                    foro.cerrado 
                    ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100' 
                    : 'bg-slate-900 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                  }`}
                  onClick={() => navigate(`/app/foro/${foro.id}`)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-black text-violet-400 bg-violet-900/20 border border-violet-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {foro.categorias?.nombre || 'General'}
                        </span>
                        {foro.videojuegos?.nombre && (
                          <span className="text-[10px] font-black text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                            {foro.videojuegos.nombre}
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`text-xl font-extrabold flex items-center gap-2 ${foro.cerrado ? 'text-slate-400' : 'text-slate-100'}`}>
                        {foro.titulo}
                        {foro.cerrado && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-900/30 text-red-400 border border-red-500/30">
                            <Lock className="w-3 h-3" /> Cerrado
                          </span>
                        )}
                      </h3>
                    </div>

                    {(rolUsuario === 1 || rolUsuario === 2) && (
                      <Button
                        variant={foro.cerrado ? "outline" : "destructive"}
                        size="icon"
                        className={`shrink-0 z-10 ${foro.cerrado ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDialogoCierre({open: true, id: foro.id, titulo: foro.titulo, cerrar: !foro.cerrado});
                        }}
                      >
                        {foro.cerrado ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>Creado el {new Date(foro.created_at).toLocaleDateString()}</span>
                    <span className="text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      Ver hilo <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <ConfirmDialog 
        open={dialogoCierre.open}
        onOpenChange={(open) => setDialogoCierre({...dialogoCierre, open})}
        title={`${dialogoCierre.cerrar ? 'Cerrar' : 'Reabrir'} foro`}
        description={`¿Seguro que quieres ${dialogoCierre.cerrar ? 'cerrar' : 'reabrir'} tu foro "${dialogoCierre.titulo}"?`}
        onConfirm={handleToggleCerradoConfirm}
      />
    </div>
  )
}