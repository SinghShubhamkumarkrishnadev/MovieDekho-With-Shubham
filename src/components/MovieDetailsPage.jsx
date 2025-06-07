import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  DollarSign, 
  Users, 
  Play,
  Heart,
  Share2,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { movieAPI } from '../services/api';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const backdropBaseUrl = 'https://image.tmdb.org/t/p/w1280';

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);


      // Fetch movie details, credits, videos, and similar movies in parallel
      const [movieResponse, creditsResponse, videosResponse, similarResponse] = await Promise.all([
        movieAPI.getMovieDetails(id),
        movieAPI.getMovieCredits(id),
        movieAPI.getMovieVideos(id),
        movieAPI.getMovieSimilar(id)
      ]);

      setMovie(movieResponse.data);
      setCredits(creditsResponse.data);
      setVideos(videosResponse.data.results || []);
      setSimilarMovies(similarResponse.data.results || []);

    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const getTrailer = () => {
    return videos.find(video => 
      video.type === 'Trailer' && video.site === 'YouTube'
    ) || videos.find(video => video.site === 'YouTube');
  };

  const handleSimilarMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleRetry = () => {
    fetchMovieDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to load movie details</h3>
          <p className="text-gray-400 mb-4">
            {error.response?.status === 404 
              ? 'Movie not found' 
              : 'Something went wrong while loading the movie details'
            }
          </p>
          <div className="flex space-x-4 justify-center">
            <button onClick={handleRetry} className="btn-primary flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Movie not found</p>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path 
    ? `${backdropBaseUrl}${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path 
    ? `${imageBaseUrl}${movie.poster_path}`
    : `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`;

  const trailer = getTrailer();
  const director = credits?.crew?.find(person => person.job === 'Director');
  const mainCast = credits?.cast?.slice(0, 6) || [];

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="sticky top-16 z-30 px-6 py-4">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Movies</span>
        </button>
      </div>

      {/* Hero Section with Backdrop */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40"></div>
          </div>
        )}

        <div className="relative z-10 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="lg:col-span-1">
                <div className="sticky top-32">
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full max-w-sm mx-auto rounded-lg shadow-2xl"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`;
                    }}
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className="text-xl text-gray-300 italic mb-4">"{movie.tagline}"</p>
                  )}

                  {/* Rating and Basic Info */}
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {movie.vote_average > 0 && (
                      <div className="flex items-center space-x-1 bg-yellow-500/20 rounded-full px-3 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">
                          {formatRating(movie.vote_average)}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ({movie.vote_count} votes)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(movie.release_date)}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    {trailer && (
                      <a
                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Watch Trailer</span>
                      </a>
                    )}
                    <button className="btn-secondary flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>Add to Favorites</span>
                    </button>
                    <button className="btn-secondary flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-700">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'cast', label: 'Cast & Crew' },
                      { id: 'details', label: 'Details' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[200px]">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {movie.overview && (
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-3">Plot</h3>
                          <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                        </div>
                      )}

                      {director && (
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-3">Director</h3>
                          <p className="text-gray-300">{director.name}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'cast' && (
                    <div className="space-y-6">
                      {mainCast.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-4">Main Cast</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {mainCast.map((actor) => (
                              <div key={actor.id} className="text-center">
                                <img
                                  src={
                                    actor.profile_path
                                      ? `${imageBaseUrl}${actor.profile_path}`
                                      : `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`
                                  }
                                  alt={actor.name}
                                  className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                                />
                                <p className="text-white font-medium text-sm">{actor.name}</p>
                                <p className="text-gray-400 text-xs">{actor.character}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Budget</p>
                              <p className="text-white">{formatCurrency(movie.budget)}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-yellow-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Revenue</p>
                              <p className="text-white">{formatCurrency(movie.revenue)}</p>
                            </div>
                          </div>

                                                    <div className="flex items-center space-x-3">
                            <Globe className="h-5 w-5 text-blue-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Original Language</p>
                              <p className="text-white">{movie.original_language?.toUpperCase() || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-purple-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Popularity</p>
                              <p className="text-white">{movie.popularity?.toFixed(0) || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-orange-400" />
                            <div>
                              <p className="text-gray-400 text-sm">Status</p>
                              <p className="text-white">{movie.status || 'N/A'}</p>
                            </div>
                          </div>

                          {movie.homepage && (
                            <div className="flex items-center space-x-3">
                              <ExternalLink className="h-5 w-5 text-cyan-400" />
                              <div>
                                <p className="text-gray-400 text-sm">Official Website</p>
                                <a
                                  href={movie.homepage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {movie.production_companies && movie.production_companies.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-white mb-3">Production Companies</h4>
                          <div className="flex flex-wrap gap-4">
                            {movie.production_companies.map((company) => (
                              <div key={company.id} className="flex items-center space-x-2 bg-gray-800 rounded-lg p-3">
                                {company.logo_path && (
                                  <img
                                    src={`${imageBaseUrl}${company.logo_path}`}
                                    alt={company.name}
                                    className="h-8 w-auto object-contain"
                                  />
                                )}
                                <span className="text-gray-300 text-sm">{company.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {movie.production_countries && movie.production_countries.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-white mb-3">Production Countries</h4>
                          <div className="flex flex-wrap gap-2">
                            {movie.production_countries.map((country, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                              >
                                {country.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <section className="px-6 py-12 bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <h3 className="section-title mb-6">Similar Movies</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {similarMovies.slice(0, 12).map((similarMovie) => (
                <div
                  key={similarMovie.id}
                  className="movie-card cursor-pointer group"
                  onClick={() => handleSimilarMovieClick(similarMovie.id)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={
                        similarMovie.poster_path
                          ? `${imageBaseUrl}${similarMovie.poster_path}`
                          : `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`
                      }
                      alt={similarMovie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`;
                      }}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                      <Play className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-6 w-6" />
                    </div>

                    {/* Rating badge */}
                    {similarMovie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-white text-xs font-medium">
                          {formatRating(similarMovie.vote_average)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {similarMovie.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(similarMovie.release_date).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <h3 className="section-title mb-6">Videos & Trailers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.slice(0, 6).map((video) => (
                <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-700 flex items-center justify-center">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full group"
                    >
                      <div className="bg-red-600 rounded-full p-4 group-hover:bg-red-700 transition-colors">
                        <Play className="h-8 w-8 text-white fill-current" />
                      </div>
                    </a>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-1">{video.name}</h4>
                    <p className="text-gray-400 text-sm">{video.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetailsPage;


