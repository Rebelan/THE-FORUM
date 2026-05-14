
export interface Usuario {
  id: string;
  username: string;
  avatar_url?: string;
  biografia?: string;
  rol_id: number;
  created_at?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  created_at?: string;
}

export interface Videojuego {
  id: number; // Será el ID de RAWG
  nombre: string;
  genero?: string;
  desarrollador?: string;
  fecha_salida?: string;
  created_at?: string;
}

export interface Foro {
  id: string;
  titulo: string;
  descripcion?: string;
  videojuego_id: number;
  categoria_id: number;
  creador_id: string;
  esta_abierto: boolean;
  created_at?: string;
}

export interface Post {
  id: string;
  foro_id: string;
  autor_id: string;
  contenido: string;
  post_citado_id?: string;
  created_at?: string;
}

export interface Notificacion {
  id: string;
  usuario_id: string;
  actor_id: string;
  foro_id: string;
  post_id: string;
  tipo: string;
  leida: boolean;
  created_at?: string;
}