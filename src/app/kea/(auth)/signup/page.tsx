'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/kea/supabase-client';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  const allChecks = Object.values(passwordChecks).every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecks) return;
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/kea/onboarding`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Check className="text-emerald-400" size={28} />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
        <p className="text-sm text-white/40 mb-6">
          We sent a confirmation link to <span className="text-white/70">{email}</span>
        </p>
        <Link href="/kea/login" className="kea-btn-secondary inline-flex items-center gap-2">
          Back to login
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-white">Create your account</h2>
        <p className="text-sm text-white/40 mt-1">Start extracting knowledge with KEA</p>
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
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="kea-input"
          placeholder="Your full name"
          required
        />
      </div>

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
            placeholder="Create a secure password"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password strength */}
        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-1.5 pt-2"
          >
            {Object.entries(passwordChecks).map(([key, passed]) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                    passed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-white/20'
                  }`}
                >
                  {passed && <Check size={10} />}
                </div>
                <span className={passed ? 'text-white/50' : 'text-white/25'}>
                  {key === 'length' && '8+ characters'}
                  {key === 'uppercase' && 'One uppercase letter'}
                  {key === 'number' && 'One number'}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !allChecks}
        className="kea-btn-primary w-full flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            Create Account
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-white/30 mt-4">
        Already have an account?{' '}
        <Link
          href="/kea/login"
          className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
