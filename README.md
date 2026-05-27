<div align="center">
  <h1>🎮 THE FORUM</h1>
  <p><b>Tu comunidad global de videojuegos.</b></p>
  <p><i>Proyecto de Fin de Grado (TFG) - Desarrollo de Aplicaciones Web (DAW)</i></p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Estado-Finalizado-success?style=for-the-badge" alt="Estado">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
</div>

---

## 📖 Sobre el proyecto

**THE FORUM** es una Single Page Application (SPA) orientada a la creación, gestión y participación en foros temáticos sobre videojuegos. 

Para evitar las limitaciones de un catálogo estático, la plataforma se nutre en tiempo real de la API de **RAWG**, ofreciendo una base de datos global de títulos sobre los que los usuarios pueden crear debates al instante. Todo ello envuelto en un diseño inmersivo (*Dark Mode*), moderno y sin interrupciones visuales.

## ✨ Características Principales

- 🛡️ **Autenticación Segura:** Sistema de registro y login gestionado mediante Supabase Auth.
- 👤 **Perfiles Personalizables:** Edición de biografía, nombre de usuario y subida de avatares personalizados.
- 🎮 **Directorio Dinámico:** Búsqueda en tiempo real de videojuegos integrada con la API de RAWG.
- 💬 **Debates y Citas:** Lectura secuencial de hilos, creación de nuevos posts y capacidad de anidar respuestas citando a otros usuarios.
- 🔍 **Gestión Personal:** Panel de "Mis Foros" con filtros dinámicos y buscador integrado.
- ⚖️ **Moderación (RBAC):** Sistema de roles (Admin, Moderador, Usuario) que permite el cierre/reapertura de hilos y el borrado de posts tóxicos.
- 📱 **Diseño Responsive:** Interfaz construida con Tailwind CSS adaptada a móviles, tablets y escritorio.

## 🛠️ Stack Tecnológico

### Frontend
- **React (v18+)** + **TypeScript**
- **Vite** (Bundler & Entorno de desarrollo)
- **Tailwind CSS** (Estilos utility-first)
- **shadcn/ui** & **Lucide React** (Componentes e Iconos)
- **Zustand** (Gestión de estado global)
- **React Router v6** (Enrutamiento SPA)

### Backend & Servicios
- **Supabase:** Base de datos PostgreSQL, Autenticación, Storage y políticas de seguridad RLS.
- **RAWG API:** Base de datos externa de videojuegos.
- **Vercel:** Despliegue continuo (CI/CD) y Edge Network.

## 🗺️ Roadmap (Mejoras Futuras)

- [ ] Implementación de "Light Mode" dinámico.
- [ ] Soporte Multi-idioma (i18n) y traducción automática de posts mediante IA.
- [ ] Sistema de Comunidades (Clanes privados).
- [ ] Gamificación: Puntos de experiencia y tienda virtual de cosméticos para perfiles.
- [ ] Minijuegos web 1vs1 integrados.
- [ ] Mejora del Sistema Social: Perfiles visitables y sistema de amistades.
- [ ] Mensajería Privada en tiempo real.

## 👨‍💻 Autor

- **Tu Nombre / Tu Alias** - *Desarrollador Full Stack*
- GitHub: [@Rebelan](https://github.com/Rebelan)

---
<div align="center">
  <i>Desarrollado con ❤️ para la comunidad gamer.</i>
</div>
