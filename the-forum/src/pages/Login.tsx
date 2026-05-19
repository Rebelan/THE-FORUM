import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gamepad2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
    } else {
      navigate('/app')
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
          <h2 className="text-center text-2xl font-black text-white mb-2">Bienvenido de nuevo</h2>
          <p className="text-center text-sm text-slate-400 mb-6">
            ¿No tienes cuenta? <Link to="/register" className="font-bold text-violet-400 hover:text-violet-300">Regístrate</Link>
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50 text-center">{error}</div>}
            <div>
              <Label className="text-slate-300">Correo</Label>
              <Input className="mt-1 bg-slate-950 border-slate-700 text-white" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label className="text-slate-300">Contraseña</Label>
              <Input className="mt-1 bg-slate-950 border-slate-700 text-white" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}