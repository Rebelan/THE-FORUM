const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

export interface JuegoBuscador {
  id: number;
  name: string;
  background_image: string;
  released: string;
}

export const rawgApi = {
  buscarJuegos: async (query: string): Promise<JuegoBuscador[]> => {
    if (!query) return [];
    try {
      const res = await fetch(`${BASE_URL}/games?key=${RAWG_API_KEY}&search=${query}&page_size=5`);
      if (!res.ok) throw new Error('Error al buscar en RAWG');
      const data = await res.json();
      return data.results;
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  //Trae los juegos más populares/añadidos
  getJuegosPopulares: async (): Promise<JuegoBuscador[]> => {
    try {
      // Pedimos 12 juegos, ordenados por popularidad (-added)
      const res = await fetch(`${BASE_URL}/games?key=${RAWG_API_KEY}&page_size=12&ordering=-added`);
      if (!res.ok) throw new Error('Error al obtener juegos populares');
      
      const data = await res.json();
      return data.results;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getJuegoDetalle: async (id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`);
      if (!res.ok) throw new Error('Error al obtener detalle del juego');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};