'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Building2,
  Globe,
  Palette,
  Save,
  Upload,
  ChevronDown,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function SettingsPage() {
  const { organization, setOrganization } = useAuthStore();
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('');
  const [language, setLanguage] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name || '');
      setSlug(organization.slug || '');
      setIndustry(organization.industry || '');
      setLanguage(organization.language || 'en');
    }
  }, [organization]);

  async function handleSave() {
    if (!organization) return;
    setSaving(true);
    setFeedback(null);

    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: orgName,
        slug: slug,
        industry: industry,
        language: language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organization.id)
      .select()
      .single();

    if (error) {
      setFeedback({ type: 'error', message: error.message });
    } else if (data) {
      setOrganization({ ...organization, ...data } as unknown as typeof organization);
      setFeedback({ type: 'success', message: 'Settings saved successfully' });
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 3000);
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
            <Settings size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Organization Settings</h2>
            <p className="text-xs text-white/30">Manage your organization profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {feedback && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs ${feedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {feedback.message}
            </motion.span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="kea-btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : feedback?.type === 'success' ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : feedback?.type === 'success' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </motion.div>

      {/* General Settings */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="kea-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={14} className="text-white/30" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            General
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Organization Name</label>
            <input
              type="text"
              className="kea-input text-sm"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/20">kea.app/</span>
              <input
                type="text"
                className="kea-input text-sm pl-16"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Industry</label>
            <div className="relative">
              <select
                className="kea-input text-sm appearance-none"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                <option value="">Select industry</option>
                <option value="furniture_manufacturing">Furniture Manufacturing</option>
                <option value="food_processing">Food Processing</option>
                <option value="textile">Textile &amp; Apparel</option>
                <option value="metal_fabrication">Metal Fabrication</option>
                <option value="construction">Construction</option>
                <option value="automotive">Automotive</option>
                <option value="electronics">Electronics</option>
                <option value="pharmaceutical">Pharmaceutical</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Language</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              <select
                className="kea-input text-sm pl-9 appearance-none"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="bg">Bulgarian</option>
                <option value="en">English</option>
                <option value="de">German</option>
                <option value="ro">Romanian</option>
                <option value="sr">Serbian</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Logo Upload */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="kea-card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Palette size={14} className="text-white/30" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Branding
          </h3>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center overflow-hidden">
            {organization.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={organization.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={28} className="text-white/15" />
            )}
          </div>
          <div>
            <p className="text-sm text-white/50 mb-2">Organization Logo</p>
            <p className="text-xs text-white/25 mb-3">
              PNG or SVG, max 2MB. Recommended: 256x256px.
            </p>
            <button className="kea-btn-secondary text-xs py-2 px-4 flex items-center gap-2">
              <Upload size={12} /> Upload Logo
            </button>
          </div>
        </div>
      </motion.div>

      {/* Plan info */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="kea-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings size={14} className="text-white/30" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Current Plan
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="kea-badge kea-badge-blue capitalize">{organization.subscription_tier || 'starter'}</span>
          <span className="text-xs text-white/30">Status: {organization.status || 'active'}</span>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="kea-card p-6 border border-red-500/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={14} className="text-red-400/50" />
          <h3 className="text-xs font-semibold text-red-400/40 uppercase tracking-wider">
            Danger Zone
          </h3>
        </div>
        <p className="text-xs text-white/30 mb-4">
          Deleting the organization will permanently remove all tracks, sessions, and extracted data. This action cannot be undone.
        </p>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-3">
            <p className="text-xs text-red-400">Are you sure? This is irreversible.</p>
            <button
              disabled
              className="kea-btn-secondary text-xs py-2 px-4 border-red-500/20 text-red-400 opacity-50 cursor-not-allowed"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="kea-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="kea-btn-secondary text-xs py-2 px-4 border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            Delete Organization
          </button>
        )}
      </motion.div>
    </div>
  );
}
