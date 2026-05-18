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
    }
  }

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !usernameEdit.trim()) return

    setGuardando(true)
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
      alert("Error al actualizar el perfil: " + error.message)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando perfil...</div>
  if (!perfil) return <div className="p-8 text-center text-red-500">No se pudo cargar el perfil.</div>

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Mi Perfil</h1>
        {!modoEdicion && (
          <Button onClick={() => setModoEdicion(true)} variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
          </Button>
        )}
      </div>

      <form onSubmit={handleGuardarPerfil} className="flex flex-col md:flex-row gap-8">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="w-full md:w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center">
          
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full border-4 border-gray-50 shadow-md bg-blue-100 flex items-center justify-center overflow-hidden">
              {vistaPreviaFoto ? (
                <img src={vistaPreviaFoto} alt="Previa" className="w-full h-full object-cover" />
              ) : perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl font-black text-blue-300">{perfil.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {modoEdicion && (
              <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 mb-1" />
                Cambiar Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleCambiarFotoLocal} />
              </label>
            )}
          </div>

          {modoEdicion ? (
            <div className="w-full space-y-1 mb-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre de usuario</label>
              <Input value={usernameEdit} onChange={(e) => setUsernameEdit(e.target.value)} required maxLength={25} />
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 text-center w-full truncate mb-2">
              {perfil.username}
            </h2>
          )}

          <div className="w-full mt-4 space-y-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Correo</p>
                <p className="text-gray-900 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                {perfil.rol_id === 1 ? <ShieldAlert className="w-4 h-4 text-red-600" /> : 
                 perfil.rol_id === 2 ? <Shield className="w-4 h-4 text-amber-600" /> : 
                 <UserIcon className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rango</p>
                <p className="font-medium text-gray-900">
                  {perfil.rol_id === 1 ? 'Administrador' : perfil.rol_id === 2 ? 'Moderador' : 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="w-full md:w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">Sobre Mí</h3>
          
          <div className="flex-1 flex flex-col">
            {modoEdicion ? (
              <textarea
                value={biografiaEdit}
                onChange={(e) => setBiografiaEdit(e.target.value)}
                placeholder="Cuéntale a la comunidad qué te gusta jugar..."
                className="w-full flex-1 min-h-[200px] p-4 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                maxLength={500}
              />
            ) : perfil.biografia ? (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{perfil.biografia}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 text-center space-y-3">
                <UserIcon className="w-12 h-12 opacity-20" />
                <p>Aún no has escrito nada sobre ti.</p>
              </div>
            )}
          </div>

          {modoEdicion && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={() => { setModoEdicion(false); setVistaPreviaFoto(null); setNuevaFoto(null); }} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-700">
                {guardando ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</> : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>

      </form>
    </div>
  )
}