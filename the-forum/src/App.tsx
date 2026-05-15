import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'

function App() {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // 1. Preguntamos a Supabase si ya hay una sesión activa al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // 2. Nos quedamos "escuchando" por si el usuario entra o sale
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Limpieza del listener cuando se desmonta el componente
    return () => subscription.unsubscribe()
  }, [setUser])

  return <RouterProvider router={router} />
}

export default App