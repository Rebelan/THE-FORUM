import { createBrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import MainLayout from '@/layouts/MainLayout'
import { AuthGuard } from '@/components/auth/authGuard'
import Main from '@/pages/Main'
import Foros from './pages/Foros'
import JuegoForos from './pages/JuegoForos'
import ForoDetalle from './pages/ForoDetalle'
import Register from './pages/Register'
import AdminUsuarios from './pages/AdminUsuarios'

export const router = createBrowserRouter([
  // RUTAS PÚBLICAS
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />
  },
  
  // RUTAS PRIVADAS (Protegidas)
  {
    path: '/app',
    element: <AuthGuard />,
    children: [
      {
        path: '', 
        element: <MainLayout />,
        children: [
          {
            path: '',
            element: <Main />, 
          },
          {
            path: 'foros',
            element: <Foros />,
          },
          {
            path: 'foros/juego/:id',
            element: <JuegoForos />, 
          },
          {
            path: 'foro/:foroId',
            element: <ForoDetalle />, 
          },
          {
            path: 'usuarios',
            element: <AdminUsuarios />,
          },
        ]
      }
    ]
  }
])