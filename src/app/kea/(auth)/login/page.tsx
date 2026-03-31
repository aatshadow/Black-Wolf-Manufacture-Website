'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/kea/supabase-client';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message === 'Invalid login credentials'
            ? 'Invalid email or password'
            : authError.message
        );
        return;
      }

      window.location.href = '/kea/dashboard';
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="text-sm text-white/40 mt-1">Sign in to your KEA account</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="kea-input"
          placeholder="you@company.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="kea-input pr-12"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/kea/forgot-password"
          className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="kea-btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Sign In
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#050510] px-3 text-white/25">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/kea/dashboard` },
          });
        }}
        className="kea-btn-secondary w-full flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-white/30 mt-4">
        Don&apos;t have an account?{' '}
        <Link
          href="/kea/signup"
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
