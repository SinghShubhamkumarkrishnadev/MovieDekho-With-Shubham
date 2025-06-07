import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { cacheAPI } from '../services/api';

const CacheManager = () => {
  const [caches, setCaches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchCacheData();
  }, []);

  const fetchCacheData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const [cachesRes, summaryRes] = await Promise.all([
        cacheAPI.getAllCaches(),
        cacheAPI.getCacheSummary()
      ]);
      
      setCaches(cachesRes.data || []);
      setSummary(summaryRes.data || {});
      
    } catch (error) {
      console.error('❌ Error fetching cache data:', error);
      setError(error);
      setCaches([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async (cacheName) => {
    try {
      setActionLoading(prev => ({ ...prev, [cacheName]: true }));
      await cacheAPI.clearCache(cacheName);
      await fetchCacheData();
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [cacheName]: false }));
    }
  };

  const handleClearAllCaches = async () => {
    try {
      setActionLoading(prev => ({ ...prev, 'all': true }));
      await cacheAPI.clearAllCaches();
      await fetchCacheData();
    } catch (error) {
      console.error('Error clearing all caches:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, 'all': false }));
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-400">Loading cache data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to load cache data</h3>
          <p className="text-gray-400 mb-4">
            {error.code === 'ECONNABORTED'
              ? 'The request timed out. The API might be slow or unavailable.'
              : error.message || 'Unable to connect to the cache service'
            }
          </p>
          <button onClick={fetchCacheData} className="btn-primary flex items-center space-x-2 mx-auto">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Cache Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={fetchCacheData}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearAllCaches}
            disabled={actionLoading.all || caches.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            {actionLoading.all ? (
              <div className="loading-spinner h-4 w-4"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Cache Summary */}
      {summary && (
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">Cache Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{summary.totalCaches || 0}</p>
                  <p className="text-gray-400">Total Caches</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{summary.totalEntries || 0}</p>
                  <p className="text-gray-400">Total Entries</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{formatBytes(summary.totalSize || 0)}</p>
                  <p className="text-gray-400">Total Size</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cache List */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-400">Cache Details</h3>
          {caches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Cache Name</th>
                    <th className="text-left py-3 px-4 text-gray-400">Entries</th>
                    <th className="text-left py-3 px-4 text-gray-400">Size</th>
                    <th className="text-left py-3 px-4 text-gray-400">Hit Rate</th>
                    <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caches.map((cache) => (
                    <tr key={cache.name} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                            <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-purple-400" />
                          <span className="font-medium text-white">{cache.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{cache.entries || 0}</td>
                      <td className="py-4 px-4 text-gray-300">{formatBytes(cache.size || 0)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${cache.hitRate || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-300">{cache.hitRate || 0}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleClearCache(cache.name)}
                          disabled={actionLoading[cache.name]}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-1 px-3 rounded transition-colors flex items-center space-x-1"
                        >
                          {actionLoading[cache.name] ? (
                            <div className="loading-spinner h-3 w-3"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          <span>Clear</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No cache data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CacheManager;
