import { useAuthStore } from '@/store/authStore'

export default function Main() {
  // Sacamos al usuario de Zustand para poder saludarle por su email
  const user = useAuthStore((state) => state.user)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
      <p className="mt-2 text-gray-600">
        ¡Hola, {user?.email}! Si estás viendo esto, significa que el AuthGuard te ha dejado pasar y el enrutamiento funciona perfecto.
      </p>
      
      <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-blue-800">
          Aquí es donde más adelante haremos el <strong>fetch a Supabase</strong> para mostrar las categorías y los foros más recientes.
        </p>
      </div>
    </div>
  )
}