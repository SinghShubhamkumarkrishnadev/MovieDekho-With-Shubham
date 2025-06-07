import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Film, Search, Star, Calendar, Play, Settings, Home, TrendingUp, AlertCircle, RefreshCw, Github, Heart, ExternalLink, Sparkles, Clock } from 'lucide-react';
import { movieAPI } from './services/api';
import MovieCard from './components/MovieCard';
import SearchBar from './components/SearchBar';
import MovieDetailsPage from './components/MovieDetailsPage';
import CacheManager from './components/CacheManager';
import GenreFilter from './components/GenreFilter';
import TrendingToggle from './components/TrendingToggle';

// Error Component (keep as is)
const ErrorMessage = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h3>
    <p className="text-gray-400 mb-4">
      {error.code === 'ECONNABORTED'
        ? 'The request timed out. The API might be slow or unavailable.'
        : error.response?.status === 0
        ? 'Network error. Please check your internet connection.'
        : error.message || 'Failed to load movies'
      }
    </p>
    <button onClick={onRetry} className="btn-primary flex items-center space-x-2 mx-auto">
      <RefreshCw className="h-4 w-4" />
      <span>Try Again</span>
    </button>
  </div>
);

// Footer Component (keep as is)
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="glass-effect mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Film className="h-8 w-8 text-purple-400" />
              <h3 className="text-2xl font-bold gradient-text">MovieTorch</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Discover amazing movies with detailed information, reviews, and recommendations. 
              Your ultimate destination for movie exploration.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made By</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>Shubham and Kiran</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Popular Movies
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Upcoming
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Now Playing
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.themoviedb.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-1"
                >
                  <span>TMDB API</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link to="/cache" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Cache Manager
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/SinghShubhamkumarkrishnadev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors flex items-center space-x-1"
                >
                  <Github className="h-4 w-4" />
                  <span>Source Code</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} MovieTorch. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>Powered by</span>
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              The Movie Database (TMDB)
            </a>
          </div>
        </div>
        
        {/* TMDB Attribution */}
        <div className="mt-4 text-xs text-gray-600 text-center">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </div>
    </footer>
  );
};

// Main Movies Page Component - UPDATED
const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // NEW STATE FOR NEW FEATURES
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [trendingTimeWindow, setTrendingTimeWindow] = useState('day');

  const categories = [
    { id: 'popular', label: 'Popular', icon: TrendingUp, api: movieAPI.getPopular },
    { id: 'top_rated', label: 'Top Rated', icon: Star, api: movieAPI.getTopRated },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar, api: movieAPI.getUpcoming },
    { id: 'now_playing', label: 'Now Playing', icon: Play, api: movieAPI.getNowPlaying },
    // NEW CATEGORIES
    { id: 'trending', label: 'Trending', icon: Sparkles, api: null }, // Special handling
    { id: 'latest', label: 'Latest', icon: Clock, api: null }, // Special handling
  ];

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery, 1);
    } else if (selectedGenre) {
      fetchMoviesByGenre(selectedGenre, 1);
    } else {
      fetchMovies(currentCategory, 1);
    }
  }, [currentCategory]);

  const fetchMovies = async (category, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Handle special categories
      if (category === 'trending') {
        response = await movieAPI.getTrending(trendingTimeWindow, page);
      } else if (category === 'latest') {
        response = await movieAPI.getLatest();
        // Latest returns single movie, so wrap in array
        if (page === 1) {
          setMovies([response.data]);
        }
        setCurrentPage(1);
        setTotalPages(1);
        setLoading(false);
        return;
      } else {
        const categoryData = categories.find(cat => cat.id === category);
        response = await categoryData.api(page);
      }
      
      if (page === 1) {
        setMovies(response.data.results || []);
      } else {
        setMovies(prev => [...prev, ...(response.data.results || [])]);
      }
      
      setCurrentPage(response.data.page || 1);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('❌ Error fetching movies:', error);
      setError(error);
      if (page === 1) {
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // NEW FUNCTIONS FOR NEW FEATURES
  const fetchTrendingMovies = async (timeWindow = 'day', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieAPI.getTrending(timeWindow, page);
      
      if (page === 1) {
        setMovies(response.data.results || []);
      } else {
        setMovies(prev => [...prev, ...(response.data.results || [])]);
      }
      
      setCurrentPage(response.data.page || 1);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('❌ Error fetching trending movies:', error);
      setError(error);
      if (page === 1) {
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMoviesByGenre = async (genreId, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieAPI.getMoviesByGenre(genreId, page);
      
      if (page === 1) {
        setMovies(response.data.results || []);
      } else {
        setMovies(prev => [...prev, ...(response.data.results || [])]);
      }
      
      setCurrentPage(response.data.page || 1);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('❌ Error fetching movies by genre:', error);
      setError(error);
      if (page === 1) {
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestMovie = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await movieAPI.getLatest();
      setMovies([response.data]); // Latest returns single movie
      setCurrentCategory('latest');
      setCurrentPage(1);
      setTotalPages(1);
    } catch (error) {
      console.error('❌ Error fetching latest movie:', error);
      setError(error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query, page = 1) => {
    if (!query.trim()) {
      setSearchQuery('');
      setError(null);
      setSelectedGenre(null);
      fetchMovies(currentCategory, 1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      setSelectedGenre(null); // Clear genre filter when searching
      
      const response = await movieAPI.searchMovies(query, page);
      
      if (page === 1) {
        setMovies(response.data.results || []);
      } else {
        setMovies(prev => [...prev, ...(response.data.results || [])]);
      }
      
      setCurrentPage(response.data.page || 1);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('❌ Error searching movies:', error);
      setError(error);
      if (page === 1) {
        setMovies([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setCurrentCategory(categoryId);
    setSearchQuery('');
    setSelectedGenre(null);
    setCurrentPage(1);
    setError(null);
    
    // Handle special categories
    if (categoryId === 'trending') {
      fetchTrendingMovies(trendingTimeWindow, 1);
    } else if (categoryId === 'latest') {
      fetchLatestMovie();
    } else {
      fetchMovies(categoryId, 1);
    }
  };

  // NEW HANDLERS FOR NEW FEATURES
  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
    setSearchQuery('');
    setCurrentPage(1);
    setError(null);
    
    if (genreId) {
      setCurrentCategory('genre');
      fetchMoviesByGenre(genreId, 1);
    } else {
      setCurrentCategory('popular');
      fetchMovies('popular', 1);
    }
  };

  const handleTrendingTimeWindowChange = (timeWindow) => {
    setTrendingTimeWindow(timeWindow);
    if (currentCategory === 'trending') {
      fetchTrendingMovies(timeWindow, 1);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (searchQuery) {
      handleSearch(searchQuery, 1);
    } else if (selectedGenre) {
      fetchMoviesByGenre(selectedGenre, 1);
    } else if (currentCategory === 'trending') {
      fetchTrendingMovies(trendingTimeWindow, 1);
    } else if (currentCategory === 'latest') {
      fetchLatestMovie();
    } else {
      fetchMovies(currentCategory, 1);
    }
  };

    const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      const nextPage = currentPage + 1;
      if (searchQuery) {
        handleSearch(searchQuery, nextPage);
      } else if (selectedGenre) {
        fetchMoviesByGenre(selectedGenre, nextPage);
      } else if (currentCategory === 'trending') {
        fetchTrendingMovies(trendingTimeWindow, nextPage);
      } else {
        fetchMovies(currentCategory, nextPage);
      }
    }
  };

  // Helper function to get current section title
  const getCurrentSectionTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    } else if (selectedGenre) {
      return `Movies by Genre`;
    } else {
      return categories.find(cat => cat.id === currentCategory)?.label || 'Movies';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section mx-6 mt-6 p-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold gradient-text mb-4">
            Discover Amazing Movies
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Explore thousands of movies with detailed information, reviews, and recommendations
          </p>
          
          <SearchBar 
            onSearch={handleSearch}
            loading={loading}
            placeholder="Search for movies..."
          />
        </div>
      </section>

      {/* Category Buttons */}
      <section className="px-6 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleCategoryChange(id)}
                disabled={loading}
                className={`category-button ${currentCategory === id ? 'active' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Filters Section */}
      <section className="px-6 mt-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Genre Filter */}
            <GenreFilter
              selectedGenre={selectedGenre}
              onGenreChange={handleGenreChange}
              loading={loading}
            />

            {/* Trending Toggle - show only when trending is selected */}
            {currentCategory === 'trending' && (
              <TrendingToggle
                timeWindow={trendingTimeWindow}
                onTimeWindowChange={handleTrendingTimeWindowChange}
                disabled={loading}
              />
            )}

            {/* Clear Filters Button */}
            {(selectedGenre || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGenre(null);
                  setSearchQuery('');
                  setCurrentCategory('popular');
                  fetchMovies('popular', 1);
                }}
                className="btn-secondary text-sm"
                disabled={loading}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      <section className="px-6 mt-8 mb-12">
        <div className="max-w-7xl mx-auto">
          <h3 className="section-title mb-6">
            {getCurrentSectionTitle()}
          </h3>
          
          {error ? (
            <ErrorMessage error={error} onRetry={handleRetry} />
          ) : loading && movies.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner"></div>
              <span className="ml-3 text-gray-400">Loading movies...</span>
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                  />
                ))}
              </div>
              
              {/* Load More Button - Don't show for latest since it's single movie */}
              {currentPage < totalPages && currentCategory !== 'latest' && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner h-4 w-4"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load More ({currentPage} of {totalPages})</span>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchQuery ? 'No movies found for your search' : 
                 selectedGenre ? 'No movies found for this genre' :
                 'No movies available'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Navigation Component (keep as is)
const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Movies', icon: Home },
    { path: '/cache', label: 'Cache', icon: Settings },
  ];

  return (
    <nav className="glass-effect sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Film className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold gradient-text">MovieTorch</h1>
        </Link>
        
        <div className="flex space-x-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link flex items-center space-x-2 ${
                location.pathname === path ? 'text-purple-400' : ''
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MoviesPage />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="/cache" element={<CacheManager />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

