import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, X, LogOut, Settings } from 'lucide-react';
import Logo from './Logo';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = (user?.user_metadata?.name as string | undefined) ?? user?.email ?? '';

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchVisible(false);
  };

  return (
    <header className="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl font-bold">PharmaQuest</h1>
          </Link>

          <div className="flex items-center gap-4 ml-auto">
            {user && (
              <>
                {/* Search bar — desktop */}
                <div className="hidden md:block relative w-[300px]">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                    searchFocused ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search toggle — mobile */}
                <button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className="md:hidden p-2 text-gray-600 hover:text-teal-600"
                  aria-label="Toggle search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 max-w-[160px] truncate">{displayName}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-white bg-teal-600 hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Search bar — mobile expanded */}
        {user && isSearchVisible && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                searchFocused ? 'text-teal-600' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                autoFocus
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
