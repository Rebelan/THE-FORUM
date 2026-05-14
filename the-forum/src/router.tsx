import { createBrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import MainLayout from '@/layouts/MainLayout'
import Main from '@/pages/Main'
import { AuthGuard } from './components/auth/authGuard'

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
        ]
      }
    ]
  }
])