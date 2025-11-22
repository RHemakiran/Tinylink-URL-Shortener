'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { truncateUrl } from '@/lib/utils';

interface Link {
  id: string;
  code: string;
  url: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/links/${code}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Link not found');
          } else {
            throw new Error('Failed to fetch link');
          }
          return;
        }
        const data = await response.json();
        setLink(data);
        setError(null);
      } catch (err) {
        setError('Failed to load link statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchLink();
    }
  }, [code]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shortUrl = link ? `${baseUrl}/${link.code}` : '';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-indigo-100">
          <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
          <p className="text-gray-600 font-medium text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-indigo-100">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-6 font-semibold text-lg">{error || 'Link not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push('/')}
        className="mb-6 px-4 py-2 bg-white/90 backdrop-blur-sm text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
      >
        <span>←</span> Back to Dashboard
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-indigo-100 p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">📊</span>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Link Statistics</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <span>🔗</span> Short Code
            </label>
            <p className="text-xl font-bold font-mono text-indigo-900 bg-white px-4 py-2 rounded-lg">{link.code}</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <span>✨</span> Short URL
            </label>
            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg">
              <p className="text-lg font-mono text-indigo-600 break-all flex-1">{shortUrl}</p>
              <button
                onClick={(e) => {
                  copyToClipboard(shortUrl);
                  const btn = e.currentTarget;
                  const original = btn.textContent;
                  btn.textContent = '✓';
                  setTimeout(() => {
                    btn.textContent = original;
                  }, 1000);
                }}
                className="text-gray-400 hover:text-indigo-600 flex-shrink-0 text-xl transition-colors"
                title="Copy short URL"
              >
                📋
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <span>🌐</span> Target URL
            </label>
            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg">
              <p className="text-sm text-gray-700 break-all flex-1 font-medium" title={link.url}>
                {truncateUrl(link.url, 80)}
              </p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 text-xl transition-colors"
              >
                🔗
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-2 border-indigo-100">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
              <label className="block text-sm font-semibold mb-2 opacity-90">Total Clicks</label>
              <p className="text-5xl font-bold">{link.clicks}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
              <label className="block text-sm font-semibold mb-2 opacity-90">Last Clicked</label>
              <p className="text-xl font-bold">
                {link.lastClicked
                  ? new Date(link.lastClicked).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-indigo-100">
            <label className="block text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
              <span>📅</span> Created At
            </label>
            <p className="text-lg text-gray-700 font-medium bg-indigo-50 px-4 py-2 rounded-lg inline-block">
              {new Date(link.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

