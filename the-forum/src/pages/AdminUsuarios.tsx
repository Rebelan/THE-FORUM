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

  if (cargando) return <div className="p-8 pt-24 text-center text-slate-500 font-medium animate-pulse min-h-screen bg-background">Cargando administración...</div>

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 overflow-x-hidden">
      <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="p-3 bg-violet-900/30 text-violet-400 rounded-xl border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0">
            <ShieldAlert className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">Gestión de Miembros</h1>
            <p className="text-slate-400 font-medium text-sm md:text-base">Panel de control de seguridad y roles</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-175">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Miembro</th>
                <th className="p-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Rango</th>
                <th className="p-4 font-bold text-slate-400 text-xs uppercase tracking-wider">Se ha unido el</th>
                <th className="p-4 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {listaUsuarios.map((u) => {
                const esYo = u.id === user?.id
                return (
                  <tr key={u.id} className={`transition-colors duration-200 ${esYo ? 'bg-violet-900/10' : 'hover:bg-slate-800/50'}`}>
                    <td className="p-4 flex items-center gap-4">
                      
                      <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-black text-slate-400 overflow-hidden shrink-0">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          u.username?.[0].toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-100 whitespace-nowrap">{u.username}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u.id.split('-')[0]}...</div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        u.rol_id === 1 ? 'bg-red-900/30 text-red-400 border-red-500/30' : 
                        u.rol_id === 2 ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {u.rol_id === 1 ? <ShieldAlert className="w-3.5 h-3.5" /> : 
                         u.rol_id === 2 ? <Shield className="w-3.5 h-3.5" /> : 
                         <User className="w-3.5 h-3.5" />}
                        {u.rol_id === 1 ? 'Admin' : u.rol_id === 2 ? 'Moderador' : 'Usuario'}
                      </span>
                    </td>
                    
                    <td className="p-4 text-slate-400 text-sm font-medium whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="p-4 text-right">
                      {!esYo ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            onClick={() => { setUsuarioAEditar(u); setNuevoUsername(u.username); setNuevoRol(u.rol_id); }}
                          >
                            <Edit className="w-4 h-4 md:mr-1" /> <span className="hidden md:inline">Editar</span>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="bg-red-950 text-red-400 border border-red-900 hover:bg-red-600 hover:text-white hover:border-red-500"
                            onClick={() => handleBanear(u.id, u.username)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center justify-center text-[10px] font-black text-violet-400 bg-violet-900/30 border border-violet-500/30 px-3 py-1.5 rounded-full uppercase tracking-wider">
                          Tú
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Dialog open={!!usuarioAEditar} onOpenChange={() => setUsuarioAEditar(null)}>
          <DialogContent className="sm:max-w-106.25 bg-slate-950 border border-slate-800 text-slate-100 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Ajustes de Cuenta</DialogTitle>
              <DialogDescription className="text-slate-400">
                Cambia la identidad o el rango del usuario en la plataforma.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Nombre de Usuario</label>
                <Input 
                  className="bg-slate-900 border-slate-700 text-white focus-visible:ring-violet-500"
                  value={nuevoUsername} 
                  onChange={(e) => setNuevoUsername(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Rango / Rol</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500" 
                  value={nuevoRol} 
                  onChange={(e) => setNuevoRol(Number(e.target.value))}
                >
                  <option value={1} className="bg-slate-900 text-white">Administrador</option>
                  <option value={2} className="bg-slate-900 text-white">Moderador</option>
                  <option value={3} className="bg-slate-900 text-white">Usuario Estándar</option>
                </select>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => setUsuarioAEditar(null)}>
                Cancelar
              </Button>
              <Button onClick={handleGuardar} disabled={guardando} className="bg-violet-600 hover:bg-violet-700 text-white font-bold">
                {guardando ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : ''}
                {guardando ? 'Guardando...' : 'Confirmar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}