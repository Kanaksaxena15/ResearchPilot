import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error, clearError, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect away
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear auth errors when mounting
  useEffect(() => {
    clearError();
    return () => clearError();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('All fields are required');
      return;
    }

    setFormLoading(true);
    try {
      await login(email, password);
      // AuthContext will trigger the useEffect to redirect
    } catch (err: any) {
      setFormLoading(false);
    }
  };

  const hasExpired = new URLSearchParams(location.search).get('expired') === 'true';

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-[#161616] border border-[#393939] p-8 rounded shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center bg-blue-600 rounded-sm">
            <Cpu size={24} className="text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white font-sans">
            Sign in to ResearchPilot
          </h2>
          <p className="mt-2 text-xs text-[#a8a8a8]">
            Or{' '}
            <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {hasExpired && (
          <div className="rounded bg-yellow-950/20 border border-yellow-700/60 p-3 text-xs text-yellow-300 flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>Your session has expired. Please log in again to continue.</span>
          </div>
        )}

        {(localError || error) && (
          <div className="rounded bg-red-950/20 border border-red-800/60 p-3 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-xs font-mono uppercase tracking-wider text-[#8d8d8d] mb-1.5">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-[#393939] bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-sm"
                placeholder="you@domain.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-[#8d8d8d] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full border border-[#393939] bg-neutral-900 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formLoading}
              className="group relative flex w-full justify-center rounded-sm bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:bg-blue-800/50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {formLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1.5">
                  Sign In
                  <ArrowRight size={14} />
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
