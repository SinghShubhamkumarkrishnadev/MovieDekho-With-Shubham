import React, { useState, useEffect } from 'react';
import { Tag, ChevronDown } from 'lucide-react';
import { movieAPI } from '../services/api';

const GenreFilter = ({ selectedGenre, onGenreChange, loading }) => {
  const [genres, setGenres] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [genresLoading, setGenresLoading] = useState(true);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setGenresLoading(true);
      const response = await movieAPI.getGenres();
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setGenresLoading(false);
    }
  };

  const handleGenreSelect = (genre) => {
    onGenreChange(genre);
    setIsOpen(false);
  };

  const selectedGenreName = selectedGenre 
    ? genres.find(g => g.id === selectedGenre)?.name || 'Unknown Genre'
    : 'All Genres';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={genresLoading || loading}
        className="btn-secondary flex items-center space-x-2 min-w-[150px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4" />
          <span>{genresLoading ? 'Loading...' : selectedGenreName}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !genresLoading && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          <button
            onClick={() => handleGenreSelect(null)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
              !selectedGenre ? 'bg-purple-600/20 text-purple-300' : 'text-gray-300'
            }`}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreSelect(genre.id)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                selectedGenre === genre.id ? 'bg-purple-600/20 text-purple-300' : 'text-gray-300'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenreFilter;
