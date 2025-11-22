import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TinyLink - URL Shortener",
  description: "Shorten your URLs and track clicks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-indigo-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-white font-bold text-xl">T</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    TinyLink
                  </h1>
                </Link>
                <div className="text-sm text-gray-600">
                  ✨ URL Shortener
                </div>
              </div>
            </div>
          </header>
          <main className="min-h-[calc(100vh-180px)]">{children}</main>
          <footer className="bg-white/60 backdrop-blur-md border-t border-indigo-100 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                  © 2024 <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TinyLink</span>. URL Shortener Service.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <a href="/healthz" className="hover:text-indigo-600 transition-colors">Health</a>
                  <span>•</span>
                  <span>Made with ❤️</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

