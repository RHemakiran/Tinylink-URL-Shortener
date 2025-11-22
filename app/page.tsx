'use client';

import { useState, useEffect } from 'react';
import { isValidUrl, isValidCode, truncateUrl } from '@/lib/utils';

interface Link {
  id: string;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', code: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'clicks' | 'created' | 'lastClicked'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/links', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch links`);
      }
      
      const data = await response.json();
      setLinks(data);
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your database connection and try again.');
      } else {
        setError(err.message || 'Failed to load links. Please refresh the page.');
      }
      console.error('Error fetching links:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.url.trim()) {
      setFormError('URL is required');
      return;
    }

    if (!isValidUrl(formData.url)) {
      setFormError('Invalid URL. Must start with http:// or https://');
      return;
    }

    if (formData.code && !isValidCode(formData.code)) {
      setFormError('Code must be 6-8 alphanumeric characters');
      return;
    }

    try {
      setFormLoading(true);
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url,
          code: formData.code || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setFormError('This code already exists. Please choose another.');
        } else {
          setFormError(data.error || 'Failed to create link');
        }
        return;
      }

      setSuccessMessage('Link created successfully!');
      setFormData({ url: '', code: '' });
      setShowAddForm(false);
      await fetchLinks();
    } catch (err) {
      setFormError('Failed to create link. Please try again.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      const response = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      await fetchLinks();
    } catch (err) {
      alert('Failed to delete link. Please try again.');
      console.error(err);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Filter and sort links
  const filteredLinks = links.filter((link) => {
    const query = searchQuery.toLowerCase();
    return (
      link.code.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'clicks') {
      comparison = a.clicks - b.clicks;
    } else if (sortBy === 'created') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'lastClicked') {
      const aTime = a.lastClicked ? new Date(a.lastClicked).getTime() : 0;
      const bTime = b.lastClicked ? new Date(b.lastClicked).getTime() : 0;
      comparison = aTime - bTime;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Shorten Your Links
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create short, memorable links and track their performance
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Links</h2>
          <p className="text-gray-600 mt-1">{sortedLinks.length} {sortedLinks.length === 1 ? 'link' : 'links'}</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setFormError(null);
            setSuccessMessage(null);
          }}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          {showAddForm ? (
            <>
              <span>✕</span> Cancel
            </>
          ) : (
            <>
              <span>+</span> Create New Link
            </>
          )}
        </button>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🔗</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Create New Short Link</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  Target URL *
                </span>
              </label>
              <input
                type="text"
                id="url"
                value={formData.url}
                onChange={(e) => {
                  setFormData({ ...formData, url: e.target.value });
                  setFormError(null);
                }}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 placeholder-gray-400"
                disabled={formLoading}
              />
            </div>
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  Custom Code (optional)
                </span>
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                  setFormError(null);
                }}
                placeholder="mycode"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 placeholder-gray-400 font-mono"
                disabled={formLoading}
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
               Leave empty to generate automatically (6-8 characters)
              </p>
            </div>
            {formError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                <span>⚠️</span> {formError}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                <span>✅</span> {successMessage}
              </div>
            )}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {formLoading ? (
                <>
                  <span className="animate-spin">⏳</span> Creating...
                </>
              ) : (
                <>
                  Create Short Link
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Search/Filter */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6 border border-indigo-100">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Search by code or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 font-medium">Loading your links...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : sortedLinks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-gray-600 text-lg font-medium mb-2">
              {searchQuery ? 'No links match your search.' : 'No links yet.'}
            </p>
            {!searchQuery && (
              <p className="text-gray-500">Click &quot;Create New Link&quot; to get started!</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortBy === 'created') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('created');
                          setSortOrder('desc');
                        }
                      }}
                      className="hover:text-indigo-900 flex items-center gap-1 transition-colors"
                    >
                      <span>🔗</span> Short Code
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <span>🌐</span> Target URL
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortBy === 'clicks') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('clicks');
                          setSortOrder('desc');
                        }
                      }}
                      className="hover:text-indigo-900 flex items-center gap-1 transition-colors"
                    >
                      Total Clicks
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortBy === 'lastClicked') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('lastClicked');
                          setSortOrder('desc');
                        }
                      }}
                      className="hover:text-indigo-900 flex items-center gap-1 transition-colors"
                    >
                      Last Clicked
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-indigo-50">
                {sortedLinks.map((link) => {
                  const shortUrl = `${baseUrl}/${link.code}`;
                  return (
                    <tr key={link.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <a
                            href={`/code/${link.code}`}
                            className="text-sm font-bold font-mono text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            {link.code}
                          </a>
                          <button
                            onClick={(e) => {
                              copyToClipboard(shortUrl);
                              // Simple feedback
                              const btn = e.currentTarget;
                              const original = btn.textContent;
                              btn.textContent = '✓';
                              setTimeout(() => {
                                btn.textContent = original;
                              }, 1000);
                            }}
                            className="text-gray-400 hover:text-indigo-600 transition-colors text-lg"
                            title="Copy short URL"
                          >
                            
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 truncate max-w-md font-medium" title={link.url}>
                          {truncateUrl(link.url, 60)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                          {link.clicks}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {link.lastClicked
                          ? new Date(link.lastClicked).toLocaleString()
                          : <span className="text-gray-400">Never</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(link.code)}
                          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

