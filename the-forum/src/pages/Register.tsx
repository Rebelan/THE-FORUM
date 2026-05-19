import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gamepad2, ArrowRight } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { username } }
      })
      if (signUpError) throw signUpError
      setExito(true)
      if (data.session) setTimeout(() => navigate('/app'), 2000)
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950 -z-10"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in slide-in-from-bottom-8 duration-700">
        <Link to="/" className="flex justify-center items-center gap-2 text-violet-500 font-black text-3xl tracking-tighter mb-8 hover:scale-105 transition-transform">
          <Gamepad2 className="w-10 h-10" />
          <span>THE FORUM</span>
        </Link>
        <div className="bg-slate-900/50 backdrop-blur-md py-8 px-6 shadow-2xl border border-slate-800 sm:rounded-2xl sm:px-10">
          <h2 className="text-center text-2xl font-black text-white mb-2">Crea tu cuenta</h2>
          <p className="text-center text-sm text-slate-400 mb-6">
            ¿Ya tienes una? <Link to="/login" className="font-bold text-violet-400 hover:text-violet-300">Inicia sesión</Link>
          </p>

          {exito ? (
            <div className="text-center space-y-4 text-emerald-400 font-bold p-4 bg-emerald-900/20 rounded-lg">
              ¡Cuenta creada con éxito! Redirigiendo...
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleRegister}>
              {error && <div className="p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50">{error}</div>}
              <div>
                <Label className="text-slate-300">Usuario</Label>
                <Input className="mt-1 bg-slate-950 border-slate-700 text-white" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={cargando} />
              </div>
              <div>
                <Label className="text-slate-300">Correo</Label>
                <Input className="mt-1 bg-slate-950 border-slate-700 text-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={cargando} />
              </div>
              <div>
                <Label className="text-slate-300">Contraseña</Label>
                <Input className="mt-1 bg-slate-950 border-slate-700 text-white" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={cargando} minLength={6} />
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold" disabled={cargando}>
                {cargando ? 'Creando...' : <>Registrarse <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}