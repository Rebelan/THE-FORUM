import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ShieldAlert, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function AdminUsuarios() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const [listaUsuarios, setListaUsuarios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [dialogoBan, setDialogoBan] = useState<{open: boolean, id: string, name: string}>({open: false, id: '', name: ''})
  
  const [usuarioAEditar, setUsuarioAEditar] = useState<any>(null)
  const [nuevoUsername, setNuevoUsername] = useState('')
  const [nuevoRol, setNuevoRol] = useState<number>(3)
  const [guardando, setGuardando] = useState(false)

  const cargarUsuarios = async () => {
    const { data } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false })
    if (data) setListaUsuarios(data)
  }

  useEffect(() => {
    async function verificar() {
      if (!user) return
      const { data: perfil } = await supabase.from('usuarios').select('rol_id').eq('id', user.id).single()
      if (!perfil || perfil.rol_id !== 1) { navigate('/app'); return; }
      await cargarUsuarios()
      setCargando(false)
    }
    verificar()
  }, [user])

  const handleGuardar = async () => {
    if (!usuarioAEditar) return
    setGuardando(true)
    try {
      const { error } = await supabase.from('usuarios').update({ username: nuevoUsername, rol_id: nuevoRol }).eq('id', usuarioAEditar.id)
      if (error) throw error
      setUsuarioAEditar(null)
      await cargarUsuarios()
    } catch (e) { alert("Error al editar"); } finally { setGuardando(false); }
  }

  const handleBanearConfirm = async () => {
    try {
      const { error } = await supabase.rpc('banear_y_limpiar_usuario', { target_id: dialogoBan.id })
      if (error) throw error
      await cargarUsuarios()
    } catch (e) { console.error("Error al banear"); } 
    setDialogoBan({open: false, id: '', name: ''})
  }

  if (cargando) return <div className="p-8 text-center animate-pulse text-slate-500">Cargando administración...</div>

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <ShieldAlert className="w-10 h-10 text-blue-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-white">Gestión de Miembros</h1>
            <p className="text-slate-400">Panel de control de seguridad y roles</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-4 font-bold text-slate-400 text-xs uppercase">Miembro</th>
                <th className="p-4 font-bold text-slate-400 text-xs uppercase">Rango</th>
                <th className="p-4 font-bold text-slate-400 text-xs uppercase">Se ha unido el</th>
                <th className="p-4 font-bold text-slate-400 text-xs uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {listaUsuarios.map((u) => {
                const esYo = u.id === user?.id
                return (
                  <tr key={u.id} className={esYo ? 'bg-violet-900/10' : 'hover:bg-slate-800/50'}>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-black text-slate-400 overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : u.username?.[0].toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-100">{u.username}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${u.rol_id === 1 ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-300'}`}>
                        {u.rol_id === 1 ? 'Admin' : u.rol_id === 2 ? 'Moderador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {!esYo && (
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setUsuarioAEditar(u); setNuevoUsername(u.username); setNuevoRol(u.rol_id); }}>
                            <Edit className="w-4 h-4 mr-1" /> Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDialogoBan({open: true, id: u.id, name: u.username})}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog 
        open={dialogoBan.open}
        onOpenChange={(open) => setDialogoBan({...dialogoBan, open})}
        title={`¿Expulsar a ${dialogoBan.name}?`}
        description="Esta acción es irreversible. El usuario perderá acceso y sus posts se mantendrán como 'Anónimo'."
        onConfirm={handleBanearConfirm}
        variant="destructive"
      />

      <Dialog open={!!usuarioAEditar} onOpenChange={() => setUsuarioAEditar(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Ajustes de Cuenta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={nuevoUsername} onChange={(e) => setNuevoUsername(e.target.value)} className="bg-slate-900 border-slate-700" />
            <select className="w-full bg-slate-900 border border-slate-700 rounded p-2" value={nuevoRol} onChange={(e) => setNuevoRol(Number(e.target.value))}>
              <option value={1}>Administrador</option>
              <option value={2}>Moderador</option>
              <option value={3}>Usuario Estándar</option>
            </select>
          </div>
          <DialogFooter>
            <Button onClick={handleGuardar}>{guardando ? <Loader2 className="animate-spin" /> : 'Confirmar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}