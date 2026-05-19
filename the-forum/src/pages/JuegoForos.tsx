import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { rawgApi } from '@/lib/rawg'
import { useAuthStore } from '@/store/authStore'
import type { Categoria } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft, Lock, Unlock } from 'lucide-react'
import { CrearForoModal } from '@/components/foros/CrearForoModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

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

    const [dialogoCierre, setDialogoCierre] = useState<{ open: boolean, id: string, titulo: string, cerrar: boolean }>({
        open: false, id: '', titulo: '', cerrar: true
    })

    const recargarForos = async () => {
        if (!id) return
        const { data: dataForos } = await supabase
            .from('foros')
            .select('*, categorias(*)')
            .eq('videojuego_id', id)
            .order('created_at', { ascending: false })

        if (dataForos) setForos(dataForos)
    }

    const handleToggleCerradoConfirm = async () => {
        try {
            const { error } = await supabase.from('foros').update({ cerrado: dialogoCierre.cerrar }).eq('id', dialogoCierre.id)
            if (error) throw error
            await recargarForos()
        } catch (error) {
            console.error(error)
        }
        setDialogoCierre({ open: false, id: '', titulo: '', cerrar: true })
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

    const forosFiltrados = foros.filter(foro => {
        const coincideTexto = foro.titulo.toLowerCase().includes(filtroTexto.toLowerCase())
        const coincideCategoria = filtroCategoria === 'todas' || foro.categoria_id.toString() === filtroCategoria
        return coincideTexto && coincideCategoria
    })

    if (cargando) {
        return <div className="p-8 text-center animate-pulse text-slate-500 font-medium bg-background min-h-screen">Cargando comunidad...</div>
    }

    return (
        <div className="animate-in fade-in duration-500 bg-background min-h-screen text-foreground">

            {/* CABECERA */}
            <div className="relative h-72 w-full bg-slate-950 overflow-hidden">
                {juego?.background_image && (
                    <img src={juego.background_image} alt={juego.name} className="w-full h-full object-cover opacity-30" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 max-w-6xl mx-auto">
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/foros')} className="mb-4 bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al directorio
                    </Button>
                    <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-tight">
                        {juego?.name || 'Comunidad'}
                    </h1>
                </div>
            </div>

            <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 -mt-2 relative z-10">

                <div className="flex flex-col md:flex-row gap-4 bg-slate-900 p-5 rounded-2xl shadow-xl border border-slate-800 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Buscar un foro por título..."
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

                    <div className="w-full md:w-auto">
                        <CrearForoModal juegoInicial={juego} onCreado={() => recargarForos()} />
                    </div>
                </div>

                {/* LISTA DE FOROS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {forosFiltrados.map((foro) => (
                        <div
                            key={foro.id}
                            className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col justify-between ${foro.cerrado
                                    ? 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                                    : 'bg-slate-900 border-slate-800 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                }`}
                            onClick={() => navigate(`/app/foro/${foro.id}`)}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <span className="text-[10px] font-black text-violet-400 bg-violet-900/20 border border-violet-500/20 px-2.5 py-1 rounded-md mb-3 inline-block uppercase tracking-wider">
                                        {foro.categorias?.nombre}
                                    </span>

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
                                            setDialogoCierre({ open: true, id: foro.id, titulo: foro.titulo, cerrar: !foro.cerrado });
                                        }}
                                    >
                                        {foro.cerrado ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmDialog
                open={dialogoCierre.open}
                onOpenChange={(open) => setDialogoCierre({ ...dialogoCierre, open })}
                title={`${dialogoCierre.cerrar ? 'Cerrar' : 'Reabrir'} foro`}
                description={`¿Seguro que quieres ${dialogoCierre.cerrar ? 'cerrar' : 'reabrir'} el foro "${dialogoCierre.titulo}"?`}
                onConfirm={handleToggleCerradoConfirm}
            />
        </div>
    )
}