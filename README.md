# 🧠 THE FORUM

> Plataforma web de foros temáticos centrada en videojuegos, diseñada para la interacción entre usuarios mediante publicaciones y debates organizados.

---

## 📌 Descripción

**THE FORUM** es una aplicación web que permite a los usuarios crear y participar en foros organizados por temáticas (inicialmente videojuegos).

El objetivo es ofrecer un entorno estructurado, moderno y escalable donde los usuarios puedan comunicarse, compartir opiniones y generar contenido.

---

## 🚀 Funcionalidades principales

- 🔐 Registro e inicio de sesión de usuarios
- 🧑‍🤝‍🧑 Gestión de roles (usuario, moderador, administrador)
- 🧵 Creación de foros por temática
- 💬 Publicación de mensajes
- 🔁 Sistema de respuestas (hilos)
- ✏️ Edición y eliminación de publicaciones
- 📩 Formulario de contacto

---

## 🧱 Tecnologías utilizadas

### Frontend
- React
- Tailwind CSS
- JavaScript (ES6+)
- HTML5

### Backend
- Supabase
  - PostgreSQL
  - Autenticación
  - API REST

---

## 🗄️ Modelo de datos

El sistema se basa en las siguientes entidades principales:

- Usuarios
- Roles
- Videojuegos
- Foros
- Publicaciones

Relación principal: Videojuego → Foro → Publicaciones

---

## 📁 Estructura del proyecto (La que seguirá)

├── src/
├── public/
├── docs/
│ ├── manual_usuario.md
│ ├── manual_tecnico.md
│ ├── manual_despliegue.md
│ └── manual_proyecto.md
└── README.md


---

## 📚 Documentación

Toda la documentación del proyecto se encuentra en la carpeta `/docs`:

- 📘 [Manual de Usuario](docs/manual_usuario.md)
- ⚙️ [Manual Técnico](docs/manual_tecnico.md)
- 🚀 [Manual de Despliegue](docs/manual_despliegue.md)
- 📊 [Manual del Proyecto](docs/manual_proyecto.md)

---

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

bash
git clone https://github.com/usuario/the-forum.git
cd the-forum

### 2. Instalar dependencias

npm install

### 3. Configurar variables de entorno

Creando el archivo .env y editandolo con:

- VITE_SUPABASE_URL=tu_url
- VITE_SUPABASE_ANON_KEY=tu_clave

### 4. Ejecutar proyecto

npm run dev

## 🌐 Despliegue
La aplicación puede desplegarse en:

- Vercel
- Netlify
- Servidores tradicionales (build /dist)

## 📱 Compatibilidad

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Dispositivos móviles y tablets

## 🔄 Evolución del proyecto

Inicialmente se planteó el uso de:
- AngularJS
- Bootstrap

Posteriormente se migró a:
- React
- Tailwind CSS

Con el objetivo de mejorar rendimiento, escalabilidad y adaptación a tecnologías actuales.

## 🧠 Autor

**Abel Constantino Muñoz**
**Desarrollo de Aplicaciones Web (DAW)**
**IES Albarregas**

## 📄 Licencia
Proyecto educativo sin fines comerciales.
