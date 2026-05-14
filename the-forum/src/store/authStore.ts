import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null }) // Limpiamos el estado al salir
  },
}))