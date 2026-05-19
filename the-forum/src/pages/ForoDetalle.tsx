import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageSquareReply, Quote, X, Lock, Unlock, AlertTriangle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog' // Importación necesaria

export default function ForoDetalle() {
  const { foroId } = useParams<{ foroId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [foro, setForo] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [rolUsuario, setRolUsuario] = useState<number>(3)

  // ESTADO PARA EL DIÁLOGO
  const [dialogoCierre, setDialogoCierre] = useState(false)

  const [nuevoPost, setNuevoPost] = useState('')
  const [postCitado, setPostCitado] = useState<any | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const cargarDatos = async () => {
    if (!foroId) return
    try {
      if (user) {
        const { data: perfil } = await supabase.from('usuarios').select('rol_id').eq('id', user.id).single()
        if (perfil) setRolUsuario(perfil.rol_id)
      }

      const { data: dataForo } = await supabase
        .from('foros')
        .select('*, videojuegos(*), categorias(*)')
        .eq('id', foroId)
        .single()
      if (dataForo) setForo(dataForo)

      const { data: dataPosts } = await supabase
        .from('posts')
        .select('*, usuarios(*)')
        .eq('foro_id', foroId)
        .order('created_at', { ascending: true })
      if (dataPosts) setPosts(dataPosts)

    } catch (error) {
      console.error("Error al cargar el foro:", error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [foroId, user])

  // LÓGICA DEL DIÁLOGO EN LUGAR DEL WINDOW.CONFIRM
  const handleToggleCerrarForo = async () => {
    try {
      const { error } = await supabase.from('foros').update({ cerrado: !foro.cerrado }).eq('id', foroId)
      if (error) throw error
      await cargarDatos()
    } catch (error) {
      alert("Error al cambiar el estado del foro")
    }
    setDialogoCierre(false)
  }

  const handleEnviarPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoPost.trim() || !user || !foroId || foro.cerrado) return

    setEnviando(true)
    try {
      const { error } = await supabase.from('posts').insert({
        foro_id: foroId,
        autor_id: user.id,
        contenido: nuevoPost.trim(),
        post_citado_id: postCitado ? postCitado.id : null
      })

      if (error) throw error

      setNuevoPost('')
      setPostCitado(null)
      await cargarDatos()

      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

    } catch (error) {
      console.error("Error al enviar post:", error)
    } finally {
      setEnviando(false)
    }
  }

  const toggleCitaMode = (postTarget: any) => {
    if (foro.cerrado) return
    setPostCitado(postTarget)
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (cargando) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse min-h-screen bg-background">Cargando debate...</div>
  if (!foro) return <div className="p-8 text-center text-red-500 font-bold min-h-screen bg-background">Foro no encontrado</div>

  const postInicial = posts.length > 0 ? posts[0] : null
  const respuestas = posts.length > 1 ? posts.slice(1) : []

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">

      {/* CABECERA DEL FORO */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start md:items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 md:mt-0 shrink-0 text-slate-400 hover:text-white hover:bg-slate-800 h-9 w-9">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-sm truncate">{foro.titulo}</h1>
                {foro.cerrado && (
                  <span className="bg-red-950 text-red-400 px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider flex items-center gap-1 border border-red-500/30">
                    <Lock className="w-3.5 h-3.5" /> Cerrado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm mt-2 font-medium">
                <span className="bg-violet-900/40 text-violet-300 px-2.5 py-0.5 rounded border border-violet-500/30 text-xs font-bold uppercase tracking-wider">
                  {foro.videojuegos?.nombre}
                </span>
                <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700 text-xs font-bold uppercase tracking-wider">
                  {foro.categorias?.nombre}
                </span>
              </div>
            </div>
          </div>
          
          {(rolUsuario === 1 || rolUsuario === 2) && (
            <Button variant={foro.cerrado ? "outline" : "destructive"} onClick={() => setDialogoCierre(true)} className={`w-full md:w-auto shrink-0 ${foro.cerrado ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white' : ''}`}>
              {foro.cerrado ? <><Unlock className="w-4 h-4 mr-2" /> Reabrir Tema</> : <><Lock className="w-4 h-4 mr-2" /> Cerrar Tema</>}
            </Button>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-5xl mx-auto p-3 md:p-4 space-y-6 mt-4 pb-44 relative">

        {/* POST INICIAL */}
        {postInicial ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-slate-950/50 border-b border-slate-800 p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-violet-400 font-black shrink-0 overflow-hidden shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  {postInicial.usuarios?.avatar_url ? (
                    <img src={postInicial.usuarios.avatar_url} alt="Avatar OP" className="w-full h-full object-cover" />
                  ) : (
                    postInicial.usuarios?.username?.charAt(0).toUpperCase() || 'OP'
                  )}
                </div>

                <div>
                  <span className="font-extrabold text-slate-100">{postInicial.usuarios?.username || 'Anónimo'}</span>
                  <span className="text-violet-400 font-bold ml-2 text-[10px] uppercase tracking-wider bg-violet-900/30 px-2 py-0.5 rounded border border-violet-500/20">Autor</span>
                </div>
              </div>
              <span className="text-slate-500 font-medium">{new Date(postInicial.created_at).toLocaleDateString()}</span>
            </div>

            <div className="p-5 md:p-8">
              <p className="whitespace-pre-wrap text-slate-200 text-base md:text-xl leading-relaxed wrap-break-word">
                {postInicial.contenido}
              </p>
            </div>

            {!foro.cerrado && (
              <div className="bg-slate-950/30 p-3 border-t border-slate-800 flex justify-end">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-violet-400 hover:bg-slate-900 h-9" onClick={() => toggleCitaMode(postInicial)}>
                  <MessageSquareReply className="w-4 h-4 mr-2" /> Responder al tema
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {/* LISTA DE RESPUESTAS */}
        <div className="space-y-4">
          {respuestas.map((post, index) => {
            const postCitadoObj = post.post_citado_id ? posts.find(p => p.id === post.post_citado_id) : null;

            return (
              <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-2">
                
                <div className="bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-800 p-4 md:w-48 shrink-0 flex flex-row md:flex-col items-center md:items-start gap-3">
                  <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 font-bold overflow-hidden shrink-0">
                    {post.usuarios?.avatar_url ? (
                      <img src={post.usuarios.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      post.usuarios?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 text-left flex flex-col md:flex-col gap-1 md:gap-1.5">
                    <div className="font-extrabold text-slate-200 text-sm truncate">
                      {post.usuarios?.username || 'Anónimo'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 bg-slate-950 border border-slate-800 px-2 py-1 rounded md:ml-auto">#{index + 2}</div>
                </div>

                <div className="p-4 md:p-5 flex-1 flex flex-col">
                  {postCitadoObj && (
                    <div className="bg-slate-950/60 border-l-4 border-violet-500 p-3 mb-4 rounded-r-md text-sm text-slate-300 relative border-y border-r">
                      <Quote className="w-5 h-5 text-violet-500/20 absolute top-2 right-2" />
                      <div className="font-bold text-violet-400 text-[11px] uppercase tracking-wider mb-1.5">
                        Respondiendo a {postCitadoObj.usuarios?.username || 'Anónimo'}:
                      </div>
                      <p className="italic text-slate-400 line-clamp-3 wrap-break-word">{postCitadoObj.contenido}</p>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-slate-200 leading-relaxed text-sm md:text-[15px] wrap-break-word">
                      {post.contenido}
                    </p>
                  </div>
                  {!foro.cerrado && (
                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-violet-400 hover:bg-slate-800 h-8 text-xs" onClick={() => toggleCitaMode(post)}>
                        <Quote className="w-3 h-3 mr-1.5" /> Citar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* CAJA DE RESPUESTA */}
        {foro.cerrado ? (
          <div className="sticky bottom-4 z-20 mt-8 bg-red-950/40 border border-red-900/50 rounded-xl p-6 flex flex-col items-center text-center text-red-400 shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-4">
            <AlertTriangle className="w-10 h-10 mb-2 opacity-80 text-red-500" />
            <h3 className="font-bold text-lg text-red-300">Este tema ha sido cerrado</h3>
          </div>
        ) : (
          <div className="sticky bottom-4 z-20 mt-8 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden border-t-2 border-t-violet-500 animate-in slide-in-from-bottom-4 backdrop-blur-sm">
            <div className="bg-slate-950 text-slate-300 px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex justify-between items-center border-b border-slate-800">
              <span>Añadir una respuesta</span>
            </div>
            <form onSubmit={handleEnviarPost} className="p-4 bg-slate-900">
              {postCitado && (
                <div className="bg-slate-950 border border-slate-700 p-2.5 mb-3 rounded-md flex justify-between items-start gap-4 transition-all duration-300">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 italic truncate wrap-break-word">{postCitado.contenido}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-red-400 hover:bg-slate-800 shrink-0 rounded-full" onClick={() => setPostCitado(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="w-full min-h-25 max-h-50 p-3 text-sm bg-slate-950 border border-slate-700 rounded-md focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-y mb-3 outline-none text-white placeholder:text-slate-500 transition-shadow duration-300"
                value={nuevoPost}
                onChange={(e) => setNuevoPost(e.target.value)}
                disabled={enviando}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!nuevoPost.trim() || enviando} className="bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] px-6 h-10 text-sm font-bold">
                  {enviando ? 'Publicando...' : 'Enviar Respuesta'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <ConfirmDialog 
          open={dialogoCierre}
          onOpenChange={setDialogoCierre}
          title={`${foro?.cerrado ? 'Reabrir' : 'Cerrar'} hilo`}
          description={`¿Seguro que quieres ${foro?.cerrado ? 'reabrir' : 'cerrar'} el hilo "${foro?.titulo}"?`}
          onConfirm={handleToggleCerrarForo}
        />
      </div>
    </div>
  )
}