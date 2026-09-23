import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import type { Movie } from '../../types/movie';
import { fetchMovies } from '../../services/movieService';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import styles from './App.module.css';

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  async function handleSearch(query: string): Promise<void> {
    setMovies([]);
    setIsError(false);
    setIsLoading(true);
    try {
      const results = await fetchMovies(query);
      setMovies(results);
      if (results.length === 0) toast.error('No movies found for your request.');
    } catch {
      setMovies([]);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.app}>
      <SearchBar onSubmit={query => void handleSearch(query)} />
      <main className={styles.main}>
        {isLoading && <Loader />}
        {isError && <ErrorMessage />}
        {!isLoading && !isError && <MovieGrid movies={movies} onSelect={setSelectedMovie} />}
      </main>
      {selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
      <Toaster position="top-right" />
    </div>
  );
}
