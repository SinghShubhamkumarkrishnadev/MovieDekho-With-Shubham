import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Eye } from 'lucide-react';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
  
  const posterUrl = movie.poster_path 
    ? `${imageBaseUrl}${movie.poster_path}`
    : `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`;

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).getFullYear();
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const handleClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div 
      className="movie-card cursor-pointer group"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.src = `https://placehold.co/300x450/374151/9CA3AF/png?text=No+Image`;
          }}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
          <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
        </div>
        
        {/* Rating badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">
              {formatRating(movie.vote_average)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(movie.release_date)}</span>
          </div>
          
          {movie.vote_count > 0 && (
            <span className="text-gray-500">
              {movie.vote_count} votes
            </span>
          )}
        </div>
        
        {movie.overview && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
