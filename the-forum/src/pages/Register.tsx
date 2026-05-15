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
      // Llamada a Supabase para registrar al usuario
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // ¡CLAVE! Esto lo lee nuestro Trigger de SQL para crear el perfil
          },
        },
      })

      if (signUpError) throw signUpError

      // Si todo va bien, mostramos el mensaje de éxito
      setExito(true)
      
      // Si Supabase autologuea al usuario (depende de si tienes la confirmación de email quitada),
      // lo mandamos a la app después de 2 segundos.
      if (data.session) {
        setTimeout(() => navigate('/app'), 2000)
      }

    } catch (err: any) {
      console.error("Error al registrar:", err)
      setError(err.message || 'Hubo un error al crear la cuenta.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 text-blue-600 font-black text-3xl tracking-tighter hover:scale-105 transition-transform">
          <Gamepad2 className="w-10 h-10" />
          <span>THE FORUM</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl cursor-pointer font-extrabold text-gray-900">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una?{' '}
          <Link to="/login" className="font-medium text-blue-600 cursor-pointer hover:text-blue-500">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          {exito ? (
            <div className="text-center space-y-4 animate-in fade-in">
              <div className="bg-green-100 text-green-800 p-4 rounded-md font-medium">
                ¡Cuenta creada con éxito!
              </div>
              <p className="text-sm text-gray-600">
                Si no te redirige automáticamente, comprueba tu email (si tienes activada la confirmación) o inicia sesión.
              </p>
              <Link to="/login">
                <Button className="w-full mt-4">Ir al Login</Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="mt-1">
                  <Input
                    id="username"
                    type="text"
                    required
                    placeholder="Ej. PlayerOne"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={cargando}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={cargando}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="mt-1">
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={cargando}
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={cargando}>
                {cargando ? 'Creando cuenta...' : (
                  <>
                    Registrarse <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}