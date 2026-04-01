'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/kea/supabase-client';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useKeaLang, localeConfig, useT, type KeaLocale } from '@/lib/kea/i18n';

const locales: KeaLocale[] = ['en', 'bg', 'es'];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { locale, setLocale } = useKeaLang();
  const t = useT();

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
      {/* Language selector */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                locale === loc
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              <span>{localeConfig[loc].flag}</span>
              <span>{localeConfig[loc].short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-white">{t('login.welcomeBack')}</h2>
        <p className="text-sm text-white/40 mt-1">{t('login.signIn')}</p>
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
          {t('login.email')}
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
          {t('login.password')}
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

      <button
        type="submit"
        disabled={loading}
        className="kea-btn-primary w-full flex items-center justify-center gap-2 mt-6"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {t('login.submit')}
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <p className="text-center text-xs text-white/20 mt-4">
        {t('login.adminNote')}
      </p>
    </form>
  );
}
