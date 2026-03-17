# 🚀 Manual de Despliegue – THE FORUM

## 1. Introducción

Este documento describe los pasos necesarios para ejecutar la aplicación THE FORUM en un entorno local.

Está orientado a desarrolladores o usuarios con conocimientos básicos de informática.

---

## 2. Requisitos previos

Antes de ejecutar la aplicación, es necesario disponer de:

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)
- Git
- Navegador web (Chrome, Firefox, Edge)

---

## 3. Clonación del repositorio

Clonar el proyecto desde GitHub:

bash
git clone https://github.com/Rebelan/THE-FORUM
id="k28dms"

Acceder a la carpeta del proyecto:

bash
cd the-forum
id="s82kdl"

---

## 4. Instalación de dependencias

Instalar las dependencias del proyecto:

bash
npm install
id="d82kdl"

---

## 5. Configuración del entorno

Crear un archivo .env en la raíz del proyecto con las siguientes variables:

env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica
id="p39dks"

Estas credenciales se obtienen desde el panel de Supabase.

---

## 6. Ejecución en entorno local

Iniciar la aplicación:

bash
npm run dev
id="f82kdl"

Por defecto, la aplicación estará disponible en:

localhost


---

## 7. Construcción para producción

Para generar la versión optimizada:

bash
npm run build
id="z92kdl"

Los archivos generados se encontrarán en la carpeta: /dist


---

## 8. Opciones de despliegue

La aplicación puede desplegarse en distintas plataformas:

### 8.1 Vercel
- Despliegue automático desde GitHub
- Ideal para aplicaciones React

### 8.2 Netlify
- Integración sencilla
- Configuración rápida

### 8.3 Hosting tradicional
- Subida manual de la carpeta `/dist`

---

## 9. Configuración de Supabase

Es necesario:

- Crear un proyecto en Supabase
- Configurar la base de datos
- Activar autenticación de usuarios
- Definir políticas de seguridad (RLS)

---

