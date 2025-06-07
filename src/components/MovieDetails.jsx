import React, { useState, useEffect } from 'react';
import { X, Star, Calendar, Clock, Globe, Play, Users, Image, MessageSquare, Tag } from 'lucide-react';
import { movieAPI } from '../services/api';

const MovieDetails = ({ movieId, onClose }) => {
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      const [movieRes, creditsRes, videosRes, reviewsRes, similarRes] = await Promise.all([
        movieAPI.getMovieDetails(movieId),
        movieAPI.getMovieCredits(movieId),
        movieAPI.getMovieVideos(movieId),
        movieAPI.getMovieReviews(movieId),
        movieAPI.getMovieSimilar(movieId)
      ]);

      setMovie(movieRes.data);
      setCredits(creditsRes.data);
      setVideos(videosRes.data.results || []);
      setReviews(reviewsRes.data.results || []);
      setSimilar(similarRes.data.results || []);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    } finally {
      setLoading(false);
    }
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
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!movie) return null;

  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="card max-w-6xl max-h-[90vh] overflow-y-auto w-full">
        {/* Header with backdrop */}
        <div className="relative">
          {backdropUrl && (
            <div 
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 rounded-full p-2 hover:bg-black/75 transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Movie Info */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <img
              src={movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : `https://via.placeholder.com/300x450/374151/9CA3AF?text=No+Image`}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-lg mx-auto md:mx-0"
            />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 gradient-text">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-gray-400 italic mb-4">"{movie.tagline}"</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span>{movie.release_date || 'TBA'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-400" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  <span>{movie.original_language?.toUpperCase() || 'N/A'}</span>
                </div>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: MessageSquare },
                { id: 'cast', label: 'Cast & Crew', icon: Users },
                { id: 'videos', label: 'Videos', icon: Play },
                { id: 'similar', label: 'Similar', icon: Image }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-purple-400 text-purple-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-purple-400">Production Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <span className="ml-2">{formatCurrency(movie.budget)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Revenue:</span>
                      <span className="ml-2">{formatCurrency(movie.revenue)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="ml-2">{movie.status || 'N/A'}</span>
                    </div>
                    {movie.production_companies && movie.production_companies.length > 0 && (
                      <div>
                        <span className="text-gray-400">Production Companies:</span>
                        <div className="mt-1">
                          {movie.production_companies.map((company) => (
                            <span key={company.id} className="inline-block bg-gray-700 rounded px-2 py-1 text-sm mr-2 mb-1">
                              {company.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {reviews.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">Latest Reviews</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-purple-300">{review.author}</span>
                            {review.author_details?.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm">{review.author_details.rating}/10</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm line-clamp-3">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cast' && credits && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {credits.cast && credits.cast.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">Cast</h3>
                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {credits.cast.slice(0, 12).map((person) => (
                        <div key={person.id} className="flex items-center space-x-3 bg-gray-800 rounded-lg p-3">
                          <img
                            src={person.profile_path
                              ? `${imageBaseUrl}${person.profile_path}`
                              : `https://via.placeholder.com/60x60/374151/9CA3AF?text=${person.name.charAt(0)}`
                            }
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{person.name}</p>
                            <p className="text-sm text-gray-400 truncate">{person.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {credits.crew && credits.crew.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">Key Crew</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {credits.crew
                        .filter(person => ['Director', 'Producer', 'Writer', 'Screenplay'].includes(person.job))
                        .slice(0, 10)
                        .map((person, index) => (
                          <div key={`${person.id}-${index}`} className="flex justify-between items-center bg-gray-800 rounded-lg p-3">
                            <span className="font-medium text-white">{person.name}</span>
                            <span className="text-sm text-gray-400">{person.job}</span>
                          </div>
                        ))}
                                            </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Videos & Trailers</h3>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.slice(0, 6).map((video) => (
                      <div key={video.id} className="bg-gray-800 rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-700 flex items-center justify-center">
                          <a
                            href={`https://www.youtube.com/watch?v=${video.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full h-full hover:bg-gray-600 transition-colors"
                          >
                            <Play className="h-12 w-12 text-purple-400" />
                          </a>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-white text-sm mb-1">{video.name}</h4>
                          <p className="text-xs text-gray-400">{video.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No videos available</p>
                )}
              </div>
            )}

            {activeTab === 'similar' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Similar Movies</h3>
                {similar.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {similar.slice(0, 12).map((movie) => (
                      <div key={movie.id} className="movie-card">
                        <div className="aspect-[2/3]">
                          <img
                            src={movie.poster_path
                              ? `${imageBaseUrl}${movie.poster_path}`
                              : `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`
                            }
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <h4 className="font-medium text-white text-xs mb-1 line-clamp-2">{movie.title}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400" />
                              <span>{movie.vote_average?.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No similar movies found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;

