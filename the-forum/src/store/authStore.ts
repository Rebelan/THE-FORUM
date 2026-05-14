import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isInitialized: boolean // Añadimos esto
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false, // Por defecto es false hasta que Supabase conteste
  setUser: (user) => set({ user, isInitialized: true }), // Cuando seteamos el usuario, ya hemos inicializado
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))