import axios from 'axios';

// Use relative URL when using proxy, absolute URL for production
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://movietorch-f-backend.onrender.com/api'
  : '/api';
  
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      code: error.code
    });

    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - API is taking too long to respond');
    } else if (error.response?.status === 0) {
      console.error('Network error - Check if API is accessible');
    } else if (error.response?.status >= 500) {
      console.error('Server error - API is having issues');
    }

    return Promise.reject(error);
  }
);

// Movie API endpoints with error handling wrapper
const apiCall = async (apiFunction, ...args) => {
  try {
    return await apiFunction(...args);
  } catch (error) {
    console.error('API call failed:', error.message);
    throw error;
  }
};

export const movieAPI = {
  // Movie lists
  getPopular: (page = 1) => apiCall(() => api.get(`/movies/popular?page=${page}`)),
  getTopRated: (page = 1) => apiCall(() => api.get(`/movies/top_rated?page=${page}`)),
  getUpcoming: (page = 1) => apiCall(() => api.get(`/movies/upcoming?page=${page}`)),
  getNowPlaying: (page = 1) => apiCall(() => api.get(`/movies/now_playing?page=${page}`)),
  
  // Search
  searchMovies: (query, page = 1) => apiCall(() => api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`)),
  
  // Movie details
  getMovieDetails: (id) => apiCall(() => api.get(`/movies/${id}`)),
  getMovieRecommendations: (id, page = 1) => apiCall(() => api.get(`/movies/${id}/recommendations?page=${page}`)),
  getMovieCredits: (id) => apiCall(() => api.get(`/movies/${id}/credits`)),
  getMovieImages: (id) => apiCall(() => api.get(`/movies/${id}/images`)),
  getMovieSimilar: (id, page = 1) => apiCall(() => api.get(`/movies/${id}/similar?page=${page}`)),
  getMovieReviews: (id, page = 1) => apiCall(() => api.get(`/movies/${id}/reviews?page=${page}`)),
  getMovieKeywords: (id) => apiCall(() => api.get(`/movies/${id}/keywords`)),
  getMovieVideos: (id) => apiCall(() => api.get(`/movies/${id}/videos`)),


  // NEW ENDPOINTS:
  getLatest: () => apiCall(() => api.get('/movies/latest')),
  getTrending: (timeWindow = 'day', page = 1) => apiCall(() => api.get(`/movies/trending?timeWindow=${timeWindow}&page=${page}`)),
  getGenres: () => apiCall(() => api.get('/movies/genres')),
  getMoviesByGenre: (genreId, page = 1) => apiCall(() => api.get(`/movies/genre?genreId=${genreId}&page=${page}`)),
  
};



// Cache API endpoints
export const cacheAPI = {
  getAllCaches: () => apiCall(() => api.get('/cache')),
  getCache: (cacheName) => apiCall(() => api.get(`/cache/${cacheName}`)),
  getCacheSummary: () => apiCall(() => api.get('/cache/summary')),
  clearCache: (cacheName) => apiCall(() => api.delete(`/cache/${cacheName}`)),
  clearAllCaches: () => apiCall(() => api.delete('/cache')),
};

export default api;
