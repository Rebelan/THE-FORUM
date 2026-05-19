// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Nuestra barra lateral encapsulada */}
      <Sidebar />

      {/* 2. El área de contenido que cambiará según la URL */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}