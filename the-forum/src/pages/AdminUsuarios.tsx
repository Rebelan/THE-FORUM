import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { ShieldAlert, Shield, User, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog'

export default function AdminUsuarios() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const [listaUsuarios, setListaUsuarios] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  
  const [usuarioAEditar, setUsuarioAEditar] = useState<any>(null)
  const [nuevoUsername, setNuevoUsername] = useState('')
  const [nuevoRol, setNuevoRol] = useState<number>(3)
  const [guardando, setGuardando] = useState(false)

  const cargarUsuarios = async () => {
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false })
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

  const handleBanear = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que quieres expulsar a ${name}? Ya no podrá loguearse pero sus posts se mantendrán como "Usuario Eliminado".`)) return
    try {
      const { error } = await supabase.rpc('banear_y_limpiar_usuario', { target_id: id })
      if (error) throw error
      await cargarUsuarios()
    } catch (e) { alert("Error al banear usuario"); }
  }

  if (cargando) return <div className="p-8 text-center animate-pulse">Cargando administración...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center gap-3 bg-slate-900 p-6 rounded-xl text-white shadow-xl">
        <ShieldAlert className="w-10 h-10 text-blue-400" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gestión de Miembros</h1>
          <p className="text-slate-400">Panel de control de seguridad y roles</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-bold text-gray-700">Miembro</th>
              <th className="p-4 font-bold text-gray-700">Rango</th>
              <th className="p-4 font-bold text-gray-700">Se ha unido el</th>
              <th className="p-4 font-bold text-gray-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listaUsuarios.map((u) => {
              const esYo = u.id === user?.id
              return (
                <tr key={u.id} className={esYo ? 'bg-blue-50/30' : 'hover:bg-gray-50'}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center font-black text-slate-600">
                      {u.username?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{u.username}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{u.id.split('-')[0]}...</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                      u.rol_id === 1 ? 'bg-red-600 text-white shadow-sm' : 
                      u.rol_id === 2 ? 'bg-amber-500 text-white shadow-sm' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.rol_id === 1 ? <ShieldAlert className="w-3.5 h-3.5" /> : 
                       u.rol_id === 2 ? <Shield className="w-3.5 h-3.5" /> : 
                       <User className="w-3.5 h-3.5" />}
                      {u.rol_id === 1 ? 'Admin' : u.rol_id === 2 ? 'Moderador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {!esYo ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setUsuarioAEditar(u); setNuevoUsername(u.username); setNuevoRol(u.rol_id); }}>
                          <Edit className="w-4 h-4 mr-1" /> Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleBanear(u.id, u.username)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">Tú</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!usuarioAEditar} onOpenChange={() => setUsuarioAEditar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustes de Cuenta</DialogTitle>
            <DialogDescription>Cambia la identidad o el rango del usuario en la plataforma.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nombre de Usuario</label>
              <Input value={nuevoUsername} onChange={(e) => setNuevoUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Rango / Rol</label>
              <select className="w-full h-10 border rounded-md px-3 text-sm" value={nuevoRol} onChange={(e) => setNuevoRol(Number(e.target.value))}>
                <option value={1}>Administrador</option>
                <option value={2}>Moderador</option>
                <option value={3}>Usuario Estándar</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUsuarioAEditar(null)}>Cancelar</Button>
            <Button onClick={handleGuardar} disabled={guardando}>{guardando ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirmar Cambios'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}