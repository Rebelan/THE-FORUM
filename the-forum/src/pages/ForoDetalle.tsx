import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageSquareReply, Quote, X, Lock, Unlock, AlertTriangle } from 'lucide-react'

export default function ForoDetalle() {
  const { foroId } = useParams<{ foroId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [foro, setForo] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [rolUsuario, setRolUsuario] = useState<number>(3) // Estado para saber si es Admin/Mod

  // Estados para crear el nuevo post
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

 
  const toggleCerrarForo = async () => {
    if (!window.confirm(`¿Seguro que quieres ${foro.cerrado ? 'reabrir' : 'cerrar'} este foro?`)) return
    try {
      const { error } = await supabase.from('foros').update({ cerrado: !foro.cerrado }).eq('id', foroId)
      if (error) throw error
      await cargarDatos()
    } catch (error) {
      alert("Error al cambiar el estado del foro")
    }
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

  const iniciarRespuesta = (postTarget: any) => {
    if (foro.cerrado) return 
    setPostCitado(postTarget)
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (cargando) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando debate...</div>
  if (!foro) return <div className="p-8 text-center text-red-500">Foro no encontrado</div>

  const postInicial = posts.length > 0 ? posts[0] : null
  const respuestas = posts.length > 1 ? posts.slice(1) : []

  return (
    <div className="min-h-screen bg-gray-100 pb-12">

      {/* CABECERA DEL FORO */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start md:items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mt-1 md:mt-0 shrink-0 text-gray-500 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 leading-tight">{foro.titulo}</h1>
                {/* ETIQUETA VISUAL CERRADO */}
                {foro.cerrado && (
                  <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 border border-red-200">
                    <Lock className="w-3.5 h-3.5" /> CERRADO
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm mt-2 font-medium">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{foro.videojuegos?.nombre}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{foro.categorias?.nombre}</span>
              </div>
            </div>
          </div>
          
          {(rolUsuario === 1 || rolUsuario === 2) && (
            <Button 
              variant={foro.cerrado ? "outline" : "destructive"} 
              onClick={toggleCerrarForo}
              className="w-full md:w-auto shrink-0"
            >
              {foro.cerrado ? <><Unlock className="w-4 h-4 mr-2" /> Reabrir Tema</> : <><Lock className="w-4 h-4 mr-2" /> Cerrar Tema</>}
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6 mt-4">

        {/* POST INICIAL */}
        {postInicial ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-100 p-4 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">OP</div>
                <div>
                  <span className="font-bold text-gray-900">Creador del Tema: </span>
                  {postInicial.usuarios?.username || 'Anónimo'}
                </div>
              </div>
              <span className="text-gray-500">{new Date(postInicial.created_at).toLocaleDateString()}</span>
            </div>

            <div className="p-6 md:p-8">
              <p className="whitespace-pre-wrap text-gray-800 text-lg md:text-xl leading-relaxed">
                {postInicial.contenido}
              </p>
            </div>

            {!foro.cerrado && (
              <div className="bg-gray-50/50 p-3 flex justify-end">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => iniciarRespuesta(postInicial)}>
                  <MessageSquareReply className="w-4 h-4 mr-2" /> Responder al tema
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-bold text-gray-800">Aún no hay post inicial</h3>
            <p className="text-gray-500 mt-2">Este foro está vacío. Sé el primero en abrir el debate.</p>
          </div>
        )}

        {/* LISTA DE RESPUESTAS */}
        <div className="space-y-4">
          {respuestas.map((post, index) => {
            const postCitadoObj = post.post_citado_id ? posts.find(p => p.id === post.post_citado_id) : null;

            return (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row">
                <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 md:w-48 shrink-0 flex md:flex-col items-center md:items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-bold">U</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-sm">
                      {post.usuarios?.username || 'Anónimo'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">#{index + 2}</div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  {postCitadoObj && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r-md text-sm text-gray-700 relative">
                      <Quote className="w-4 h-4 text-blue-300 absolute top-2 right-2" />
                      <div className="font-semibold text-blue-800 text-xs mb-1">Respondiendo a:</div>
                      <p className="italic line-clamp-3">{postCitadoObj.contenido}</p>
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-gray-800 leading-relaxed text-[15px]">
                      {post.contenido}
                    </p>
                  </div>

                  {!foro.cerrado && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600 h-8 text-xs" onClick={() => iniciarRespuesta(post)}>
                        <Quote className="w-3 h-3 mr-1.5" /> Citar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {foro.cerrado ? (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center text-center text-red-800 shadow-sm">
            <AlertTriangle className="w-12 h-12 mb-3 opacity-80 text-red-500" />
            <h3 className="font-bold text-xl mb-1">Este tema ha sido cerrado</h3>
            <p className="text-sm opacity-90 max-w-lg mt-2">
              El equipo de moderación ha cerrado este foro. Ya no se admiten nuevas respuestas, pero puedes seguir leyendo el historial de mensajes.
            </p>
          </div>
        ) : (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" id="caja-respuesta">
            <div className="bg-slate-900 text-white px-4 py-3 font-semibold text-sm">
              Añadir una respuesta
            </div>

            <form onSubmit={handleEnviarPost} className="p-4">
              {postCitado && (
                <div className="bg-blue-50 border border-blue-200 p-3 mb-4 rounded-md flex justify-between items-start gap-4">
                  <div>
                    <div className="text-xs font-bold text-blue-800 mb-1 flex items-center">
                      <Quote className="w-3 h-3 mr-1" /> Vas a citar este mensaje:
                    </div>
                    <p className="text-sm text-gray-600 italic line-clamp-2">{postCitado.contenido}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-red-600 shrink-0" onClick={() => setPostCitado(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                placeholder={posts.length === 0 ? "Escribe el post inicial para abrir el debate..." : "Escribe tu respuesta aquí..."}
                className="w-full min-h-37.5 p-4 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y mb-4"
                value={nuevoPost}
                onChange={(e) => setNuevoPost(e.target.value)}
                disabled={enviando}
                required
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={!nuevoPost.trim() || enviando} className="bg-blue-600 hover:bg-blue-700 px-8">
                  {enviando ? 'Publicando...' : (posts.length === 0 ? 'Publicar Tema' : 'Responder')}
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}