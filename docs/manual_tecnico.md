# 📘 Manual Técnico – THE FORUM

## 1. Introducción

Este documento describe la arquitectura técnica, tecnologías utilizadas y estructura del sistema de la aplicación THE FORUM.

Está dirigido a desarrolladores o personal técnico que necesite comprender el funcionamiento interno del sistema.

---

## 2. Descripción general del sistema

THE FORUM es una aplicación web de foros temáticos orientados principalmente a videojuegos.

Permite a los usuarios registrarse, crear foros y participar en conversaciones mediante publicaciones organizadas en hilos.

---

## 3. Tecnologías utilizadas

### 3.1 Frontend
- **React**: Librería JavaScript para la construcción de interfaces de usuario.
- **Tailwind CSS**: Framework de estilos para diseño rápido y responsive.
- **HTML5**: Estructura base de la aplicación.
- **JavaScript (ES6+)**: Lógica de la aplicación en cliente.

### 3.2 Backend
- **Supabase**:
  - Base de datos PostgreSQL
  - Sistema de autenticación
  - API REST automática
  - Almacenamiento de archivos

### 3.3 Base de datos
- **PostgreSQL** gestionado a través de Supabase.

---

## 4. Arquitectura del sistema

La aplicación sigue una arquitectura cliente-servidor:

- **Cliente (Frontend)**:
  - Gestiona la interfaz de usuario
  - Realiza peticiones a Supabase

- **Servidor (Backend - Supabase)**:
  - Gestiona la base de datos
  - Autenticación de usuarios
  - Control de acceso mediante políticas

---

## 5. Requisitos del sistema

### 5.1 Requisitos funcionales

- RF1: Registro e inicio de sesión de usuarios
- RF2: Gestión de usuarios por administrador (CRUD)
- RF3: Creación de foros
- RF4: Formulario de contacto
- RF5: Publicación de mensajes con posibilidad de edición y eliminación

### 5.2 Requisitos no funcionales

- Compatibilidad con navegadores modernos
- Diseño responsive
- Sistema escalable
- Interfaz intuitiva
- Optimización del proceso de login mediante ventanas emergentes

---

## 6. Modelo de datos

El sistema se basa en un modelo relacional compuesto por las siguientes entidades:

### 6.1 Entidades principales

- Usuario
- Rol
- Videojuego
- Foro
- Post

### 6.2 Descripción de tablas

#### Usuario
- id_usuario (PK)
- nombre_usuario
- email
- contraseña
- fecha_registro
- estado

#### Rol
- id_rol (PK)
- nombre_rol
- descripción

#### Videojuego
- id_videojuego (PK)
- título
- descripción
- fecha_lanzamiento

#### Foro
- id_foro (PK)
- título
- descripción
- fecha_creacion
- estado
- fk_creado_por
- fk_videojuego

#### Post
- id_post (PK)
- fecha_publicacion
- fk_usuario
- fk_foro
- fk_post_padre (para hilos)
- fk_videojuego

---

## 7. Relaciones entre entidades

- Rol 1 → N Usuario
- Usuario 1 → N Foro
- Videojuego 1 → N Foro
- Foro 1 → N Post
- Usuario 1 → N Post
- Post 1 → N Post (autorreferencia para hilos)

---

## 8. Gestión de roles y permisos

El sistema contempla los siguientes roles:

- Invitado
- Usuario registrado
- Moderador
- Administrador

### Permisos:
- Usuarios: crear contenido
- Moderadores: gestionar contenido
- Administradores: control total del sistema

---

## 9. Estructura del proyecto

Ejemplo de estructura del frontend:

src:
    - components 
    - pages
    - services
    - hooks
    - styles
    - App.jsx

---

## 10. Comunicación con el backend

La comunicación con Supabase se realiza mediante:

- API REST automática
- SDK oficial de Supabase para JavaScript

Operaciones principales:
- Autenticación de usuarios
- Consultas a base de datos
- Inserción y actualización de datos

---

## 11. Seguridad

- Autenticación mediante Supabase Auth
- Control de acceso con políticas (Row Level Security)
- Validación de datos en cliente

---

## 12. Diseño responsive

La interfaz está desarrollada con Tailwind CSS, permitiendo:

- Adaptación a móviles
- Adaptación a tablets
- Experiencia consistente en escritorio

---

## 13. Entorno de desarrollo

- Visual Studio Code
- Git y GitHub
- Navegadores: Chrome, Edge, Firefox

---

## 14. Control de versiones

El proyecto utiliza Git para:

- Control de cambios
- Gestión de ramas
- Trabajo colaborativo

---

## 15. Escalabilidad

El sistema está diseñado para:

- Añadir nuevos tipos de contenido
- Expandir a otros temas (no solo videojuegos)
- Incorporar nuevas funcionalidades sin modificar la base existente

---

## 16. Cambios tecnológicos respecto al diseño inicial

Inicialmente se planteó el uso de AngularJS y Bootstrap.

Durante el desarrollo se decidió migrar a:

- React
- Tailwind CSS

Motivos:
- Mejor rendimiento
- Mayor flexibilidad
- Tecnologías más actuales

---

