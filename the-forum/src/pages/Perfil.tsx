import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ShieldAlert, Shield, User as UserIcon, Mail, Edit2, Loader2, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Perfil() {
  const user = useAuthStore((state) => state.user)
  
  const [perfil, setPerfil] = useState<any>(null)
  const [cargando, setCargando] = useState(true)

  // Estados para el modo edición
  const [modoEdicion, setModoEdicion] = useState(false)
  const [usernameEdit, setUsernameEdit] = useState('')
  const [biografiaEdit, setBiografiaEdit] = useState('')
  const [nuevaFoto, setNuevaFoto] = useState<File | null>(null)
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  

  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  async function cargarPerfil() {
    if (!user) return
    const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
    
    if (data) {
      setPerfil(data)
      setUsernameEdit(data.username || '')
      setBiografiaEdit(data.biografia || '')
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarPerfil()
  }, [user])

  const handleCambiarFotoLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const archivo = e.target.files[0]
      setNuevaFoto(archivo)
      setVistaPreviaFoto(URL.createObjectURL(archivo))
      setErrorMensaje(null)
    }
  }

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !usernameEdit.trim()) return

    setGuardando(true)
    setErrorMensaje(null)

    try {
      let urlFinalAvatar = perfil.avatar_url

      if (nuevaFoto) {
        const extension = nuevaFoto.name.split('.').pop()
        const nombreArchivo = `${user.id}-${Math.random()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(nombreArchivo, nuevaFoto, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(nombreArchivo)
        urlFinalAvatar = urlData.publicUrl
      }

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          username: usernameEdit.trim(),
          biografia: biografiaEdit.trim(),
          avatar_url: urlFinalAvatar
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setModoEdicion(false)
      setNuevaFoto(null)
      setVistaPreviaFoto(null)
      
      await cargarPerfil()
      
      window.dispatchEvent(new Event('perfilActualizado'))

    } catch (error: any) {
      console.error(error)
      setErrorMensaje(error.message || "Error al actualizar el perfil. Inténtalo de nuevo.")
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <div className="p-8 pt-24 text-center text-slate-500 font-medium animate-pulse min-h-screen bg-background">Cargando perfil...</div>
  if (!perfil) return <div className="p-8 pt-24 text-center text-red-500 font-bold min-h-screen bg-background">No se pudo cargar el perfil.</div>

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-hidden">
      <div className="max-w-5xl mx-auto p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Mi Perfil</h1>
          {!modoEdicion && (
            <Button 
              onClick={() => setModoEdicion(true)} 
              variant="outline" 
              className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
            </Button>
          )}
        </div>

        <form onSubmit={handleGuardarPerfil} className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          <div className="w-full md:w-1/3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 flex flex-col items-center relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-violet-900/20 to-transparent pointer-events-none"></div>

            <div className="relative group mb-6 mt-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-slate-800 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                {vistaPreviaFoto ? (
                  <img src={vistaPreviaFoto} alt="Previa" className="w-full h-full object-cover" />
                ) : perfil.avatar_url ? (
                  <img src={perfil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl md:text-6xl font-black text-violet-400 drop-shadow-md">
                    {perfil.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {modoEdicion && (
                <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border-4 border-violet-500/50">
                  <Camera className="w-6 h-6 mb-1" />
                  Cambiar Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleCambiarFotoLocal} />
                </label>
              )}
            </div>

            {modoEdicion ? (
              <div className="w-full space-y-1 mb-2">
                <label className="text-[11px] font-black text-violet-400 uppercase tracking-wider">Nombre de usuario</label>
                <Input 
                  value={usernameEdit} 
                  onChange={(e) => {
                    setUsernameEdit(e.target.value)
                    setErrorMensaje(null)
                  }} 
                  required 
                  maxLength={25} 
                  className="bg-slate-950 border-slate-700 text-white font-bold text-center focus-visible:ring-violet-500"
                />
              </div>
            ) : (
              <h2 className="text-2xl md:text-3xl font-black text-white text-center w-full truncate mb-2 drop-shadow-sm">
                {perfil.username}
              </h2>
            )}

            <div className="w-full mt-6 space-y-4 border-t border-slate-800/80 pt-6 relative z-10">
              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Correo</p>
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                  perfil.rol_id === 1 ? 'bg-red-900/20 border-red-500/30 text-red-400' : 
                  perfil.rol_id === 2 ? 'bg-amber-900/20 border-amber-500/30 text-amber-400' : 
                  'bg-violet-900/20 border-violet-500/30 text-violet-400'
                }`}>
                  {perfil.rol_id === 1 ? <ShieldAlert className="w-4 h-4" /> : 
                   perfil.rol_id === 2 ? <Shield className="w-4 h-4" /> : 
                   <UserIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Rango</p>
                  <p className="text-sm font-bold text-slate-200">
                    {perfil.rol_id === 1 ? 'Administrador' : perfil.rol_id === 2 ? 'Moderador' : 'Usuario'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 md:p-8 flex flex-col">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-violet-400" /> Sobre Mí
            </h3>
            
            <div className="flex-1 flex flex-col">
              {modoEdicion ? (
                <div className="flex-1 flex flex-col h-full min-h-62.5">
                  <textarea
                    value={biografiaEdit}
                    onChange={(e) => {
                      setBiografiaEdit(e.target.value)
                      setErrorMensaje(null)
                    }}
                    placeholder="Cuéntale a la comunidad qué te gusta jugar, tus logros, o tus sagas favoritas..."
                    className="w-full flex-1 p-4 text-base bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-shadow"
                    maxLength={500}
                  />
                  <div className="text-right text-xs font-medium text-slate-500 mt-2">
                    {biografiaEdit.length} / 500
                  </div>
                </div>
              ) : perfil.biografia ? (
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg p-2">
                  {perfil.biografia}
                </p>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 text-center space-y-4 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="font-medium text-slate-400">Aún no has escrito nada sobre ti.</p>
                </div>
              )}
            </div>

            {errorMensaje && (
              <div className="mt-6 p-3 bg-red-950/50 border border-red-900 rounded-lg flex items-start gap-3 text-red-400 text-sm animate-in fade-in">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMensaje}</span>
              </div>
            )}

            {modoEdicion && (
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { 
                    setModoEdicion(false); 
                    setVistaPreviaFoto(null); 
                    setNuevaFoto(null); 
                    setErrorMensaje(null);
                  }} 
                  disabled={guardando}
                  className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={guardando} 
                  className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</> : 'Guardar Cambios'}
                </Button>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  )
}