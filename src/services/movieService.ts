import axios from 'axios';
import type { Movie } from '../types/movie';

interface SearchMoviesResponse {
  results: Movie[];
}

export async function fetchMovies(query: string): Promise<Movie[]> {
  const token = import.meta.env.VITE_TMDB_TOKEN;
  if (!token) throw new Error('Missing VITE_TMDB_TOKEN environment variable.');

  const response = await axios.get<SearchMoviesResponse>('https://api.themoviedb.org/3/search/movie', {
    params: { query },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.results;
}
