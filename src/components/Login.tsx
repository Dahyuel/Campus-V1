import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { CAMPUS_LOGO_URL } from '../data/mockData';
import { useAuth } from '../context/AuthContext.tsx';

export const Login: React.FC = () => {
  const { login, isLoading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local error with auth context error
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();

    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setError('Please enter both identity email and password.');
      return;
    }

    try {
      await login(cleanIdentifier, cleanPassword);
      navigate('/Home', { replace: true });
    } catch {
      // Error is already surfaced by auth context and synced above
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header / Logo */}
      <div className="w-full max-w-lg flex flex-col items-center mb-6">
        <div className="h-20 sm:h-24 flex items-center justify-center mb-2">
          <img
            src={CAMPUS_LOGO_URL}
            alt="Nilebyte Campus Logo"
            className="h-full w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight text-center">
          Campus Portal Authentication
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 text-center">
          One Campus. Every Mind. — Access your dedicated role workspace
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-8 relative overflow-hidden">
        {/* Error message if invalid credentials entered */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Account Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email@nilebyte.edu or username"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3256a8] focus:ring-2 focus:ring-[#3256a8]/10 outline-none transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#3256a8] focus:ring-2 focus:ring-[#3256a8]/10 outline-none transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#3256a8] hover:bg-[#2c4c96] active:scale-[0.99] text-white font-bold text-sm rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(50,86,168,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer info */}
      <footer className="mt-8 text-center text-xs text-slate-400 space-y-1">
        <p>One Campus. Every Mind. — Nilebyte Systems</p>
        <p className="text-[11px] text-slate-400/80">
          Faculty, Administrator, Department Head, Dean, and Student Workspaces
        </p>
      </footer>
    </div>
  );
};
