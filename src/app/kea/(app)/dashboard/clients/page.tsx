'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  ChevronRight,
  Loader2,
  Check,
  Trash2,
  UserPlus,
  FileText,
  Copy,
  Eye,
  EyeOff,
  Download,
  Activity,
  MessageSquare,
  Users,
  AlertTriangle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

interface ClientOrg {
  id: string;
  name: string;
  slug: string;
  industry: string;
  language: string;
  status: string;
  active_template_id: string | null;
  created_at: string;
}

interface TemplateOption {
  id: string;
  name: string;
  industry: string;
  organization_id: string | null;
}

interface ClientUser {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface TrackProgress {
  id: string;
  name: string;
  code: string;
  totalFields: number;
  filledFields: number;
  completion: number;
  blockCount: number;
  sessions: number;
}

interface ClientProgress {
  sessions: number;
  users: number;
  alerts: number;
  lastActivity: string | null;
  totalFields: number;
  filledFields: number;
  globalCompletion: number;
  tracks: TrackProgress[];
}

function ProgressRing({ percentage, size = 64 }: { percentage: number; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage < 25 ? '#EF4444' : percentage < 50 ? '#F59E0B' : percentage < 80 ? '#3B82F6' : '#10B981';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ClientsPage() {
  const { organization } = useAuthStore();
  const [clients, setClients] = useState<ClientOrg[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientUsers, setClientUsers] = useState<Record<string, ClientUser[]>>({});
  const [clientProgress, setClientProgress] = useState<Record<string, ClientProgress>>({});
  const [loadingUsers, setLoadingUsers] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);

  // Create client form
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newIndustry, setNewIndustry] = useState('manufacturing');
  const [newLanguage, setNewLanguage] = useState('en');
  const [newTemplateId, setNewTemplateId] = useState('');
  const [creating, setCreating] = useState(false);

  // Add user form
  const [addingUserTo, setAddingUserTo] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('domain_expert');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Template cloning
  const [cloningTemplate, setCloningTemplate] = useState<string | null>(null);

  // Extract
  const [extracting, setExtracting] = useState<string | null>(null);

  // Active tab per client
  const [activeTab, setActiveTab] = useState<Record<string, 'progress' | 'users'>>({});

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setClients(data as ClientOrg[]);
    setLoading(false);
  }, []);

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase
      .from('templates')
      .select('id, name, industry, organization_id')
      .order('created_at', { ascending: false });
    if (data) setTemplates(data);
  }, []);

  useEffect(() => {
    fetchClients();
    fetchTemplates();
  }, [fetchClients, fetchTemplates]);

  const loadClientData = async (clientId: string) => {
    // Load users
    if (!clientUsers[clientId]) {
      setLoadingUsers(clientId);
      const { data } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, created_at')
        .eq('organization_id', clientId)
        .order('created_at', { ascending: true });
      if (data) setClientUsers((prev) => ({ ...prev, [clientId]: data }));
      setLoadingUsers(null);
    }

    // Load progress
    if (!clientProgress[clientId]) {
      setLoadingProgress(clientId);
      try {
        const res = await fetch(`/api/kea/client-progress?organizationId=${clientId}`);
        const data = await res.json();
        if (!data.error) {
          setClientProgress((prev) => ({ ...prev, [clientId]: data }));
        }
      } catch {
        // ignore
      }
      setLoadingProgress(null);
    }
  };

  const toggleExpand = (clientId: string) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);
      if (!activeTab[clientId]) {
        setActiveTab((prev) => ({ ...prev, [clientId]: 'progress' }));
      }
      loadClientData(clientId);
    }
  };

  const masterTemplates = templates.filter(
    (t) => !t.organization_id || t.organization_id === organization?.id
  );

  const handleCreateClient = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setCreating(true);

    const { data: newOrg, error } = await supabase
      .from('organizations')
      .insert({
        name: newName.trim(),
        slug: newSlug.trim(),
        industry: newIndustry,
        language: newLanguage,
        status: 'active',
      })
      .select('*')
      .single();

    if (!error && newOrg) {
      if (newTemplateId) {
        await cloneTemplateToOrg(newTemplateId, newOrg.id);
      }
      setNewName('');
      setNewSlug('');
      setNewIndustry('manufacturing');
      setNewLanguage('en');
      setNewTemplateId('');
      setShowCreate(false);
      fetchClients();
      fetchTemplates();
    } else {
      alert(`Error: ${error?.message}`);
    }
    setCreating(false);
  };

  const cloneTemplateToOrg = async (templateId: string, orgId: string) => {
    setCloningTemplate(orgId);
    try {
      const res = await fetch('/api/kea/clone-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, targetOrganizationId: orgId }),
      });
      const result = await res.json();
      if (result.success) {
        fetchClients();
        fetchTemplates();
      } else {
        alert(`Error cloning template: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
    setCloningTemplate(null);
  };

  const handleAssignTemplate = async (clientId: string, templateId: string) => {
    if (!templateId) {
      await supabase.from('organizations').update({ active_template_id: null }).eq('id', clientId);
      setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, active_template_id: null } : c)));
      return;
    }
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && tmpl.organization_id !== clientId) {
      await cloneTemplateToOrg(templateId, clientId);
    } else {
      await supabase.from('organizations').update({ active_template_id: templateId }).eq('id', clientId);
      setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, active_template_id: templateId } : c)));
    }
  };

  const handleAddUser = async (clientId: string) => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;
    setCreatingUser(true);
    try {
      const res = await fetch('/api/kea/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newUserName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword.trim(),
          organizationId: clientId,
          role: newUserRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        const { data } = await supabase
          .from('user_profiles')
          .select('id, full_name, role, created_at')
          .eq('organization_id', clientId)
          .order('created_at', { ascending: true });
        if (data) setClientUsers((prev) => ({ ...prev, [clientId]: data }));
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('domain_expert');
        setShowNewPassword(false);
        setAddingUserTo(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
    setCreatingUser(false);
  };

  const handleRemoveUser = async (clientId: string, userId: string) => {
    if (!confirm('Remove this user?')) return;
    await supabase.from('user_profiles').delete().eq('id', userId);
    fetch('/api/kea/create-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
    setClientUsers((prev) => ({
      ...prev,
      [clientId]: (prev[clientId] || []).filter((u) => u.id !== userId),
    }));
  };

  const handleExtract = async (clientId: string, format: 'json' | 'csv') => {
    setExtracting(clientId);
    try {
      const res = await fetch(`/api/kea/extract-client?organizationId=${clientId}&format=${format}`);
      const client = clients.find((c) => c.id === clientId);
      const filename = `${client?.slug || 'client'}-extraction-${new Date().toISOString().slice(0, 10)}`;

      if (format === 'csv') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
    setExtracting(null);
  };

  const refreshProgress = async (clientId: string) => {
    setLoadingProgress(clientId);
    try {
      const res = await fetch(`/api/kea/client-progress?organizationId=${clientId}`);
      const data = await res.json();
      if (!data.error) {
        setClientProgress((prev) => ({ ...prev, [clientId]: data }));
      }
    } catch { /* ignore */ }
    setLoadingProgress(null);
  };

  const roleLabels: Record<string, string> = {
    admin: 'Admin', consultant: 'Consultant', domain_expert: 'Domain Expert', manager: 'Manager', viewer: 'Viewer',
  };
  const roleBadge: Record<string, string> = {
    admin: 'kea-badge-red', consultant: 'kea-badge-blue', domain_expert: 'kea-badge-amber', manager: 'kea-badge-blue', viewer: 'kea-badge-green',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center">
            <Building2 size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Clients</h2>
            <p className="text-xs text-white/30">{clients.length} organizations</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="kea-btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={14} /> New Client
        </button>
      </div>

      {/* Create Client Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="kea-card kea-glow-border p-6">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Create New Client</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Client Name *</label>
                  <input type="text" className="kea-input text-sm w-full" placeholder="Acme Manufacturing"
                    value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Slug *</label>
                  <input type="text" className="kea-input text-sm w-full font-mono" placeholder="acme-manufacturing"
                    value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Industry</label>
                  <input type="text" className="kea-input text-sm w-full" placeholder="manufacturing"
                    value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Language</label>
                  <select className="kea-input text-sm w-full" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="bg">Bulgarian</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Assign Template</label>
                  <select className="kea-input text-sm w-full" value={newTemplateId} onChange={(e) => setNewTemplateId(e.target.value)}>
                    <option value="">No template</option>
                    {masterTemplates.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                  {newTemplateId && (
                    <p className="text-[10px] text-blue-400/50 mt-1 flex items-center gap-1">
                      <Copy size={9} /> Template will be cloned for this client
                    </p>
                  )}
                </div>
                <div className="flex items-end">
                  <button onClick={handleCreateClient} disabled={!newName.trim() || !newSlug.trim() || creating}
                    className="kea-btn-primary text-sm w-full flex items-center justify-center gap-2 disabled:opacity-30">
                    {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {creating ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client List */}
      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="kea-card p-12 text-center">
            <Building2 size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">No clients yet. Create your first client above.</p>
          </div>
        ) : (
          clients.map((client, i) => {
            const isExpanded = expandedClient === client.id;
            const users = clientUsers[client.id] || [];
            const progress = clientProgress[client.id];
            const clientTemplate = templates.find((t) => t.id === client.active_template_id);
            const isCloning = cloningTemplate === client.id;
            const tab = activeTab[client.id] || 'progress';

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="kea-card overflow-hidden"
              >
                {/* Client row */}
                <button
                  onClick={() => toggleExpand(client.id)}
                  className="w-full p-5 flex items-center gap-4 hover:bg-white/[0.01] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-blue-500/10 border border-purple-500/15 flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{client.name}</h3>
                      <span className={`kea-badge text-[9px] ${client.status === 'active' ? 'kea-badge-green' : 'kea-badge-red'}`}>
                        {client.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                      <span className="font-mono">{client.slug}</span>
                      <span>{client.industry}</span>
                      <span>{client.language.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Mini progress indicator */}
                    {progress && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              progress.globalCompletion < 25 ? 'bg-red-400' : progress.globalCompletion < 50 ? 'bg-amber-400' : progress.globalCompletion < 80 ? 'bg-blue-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${progress.globalCompletion}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">{progress.globalCompletion}%</span>
                      </div>
                    )}
                    {clientTemplate ? (
                      <span className="kea-badge kea-badge-blue text-[10px] flex items-center gap-1">
                        <FileText size={10} /> {clientTemplate.name.slice(0, 20)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/20">No template</span>
                    )}
                    <ChevronRight size={16} className={`text-white/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/[0.04]">
                        {/* Tabs */}
                        <div className="flex items-center gap-0 px-5 pt-3">
                          <button
                            onClick={() => setActiveTab((p) => ({ ...p, [client.id]: 'progress' }))}
                            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
                              tab === 'progress' ? 'bg-white/[0.04] text-blue-400 border-b-2 border-blue-400' : 'text-white/30 hover:text-white/50'
                            }`}
                          >
                            <BarChart3 size={12} className="inline mr-1.5 -mt-0.5" />
                            Extraction Progress
                          </button>
                          <button
                            onClick={() => setActiveTab((p) => ({ ...p, [client.id]: 'users' }))}
                            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-all ${
                              tab === 'users' ? 'bg-white/[0.04] text-blue-400 border-b-2 border-blue-400' : 'text-white/30 hover:text-white/50'
                            }`}
                          >
                            <Users size={12} className="inline mr-1.5 -mt-0.5" />
                            Users ({users.length})
                          </button>
                        </div>

                        <div className="px-5 pb-5 pt-3 space-y-4">
                          {/* ═══ PROGRESS TAB ═══ */}
                          {tab === 'progress' && (
                            <div className="space-y-4">
                              {/* Template assignment */}
                              <div className="flex items-center gap-3">
                                <select
                                  className="kea-input text-sm flex-1 max-w-sm"
                                  value=""
                                  onChange={(e) => handleAssignTemplate(client.id, e.target.value)}
                                >
                                  <option value="">
                                    {clientTemplate ? `Template: ${clientTemplate.name}` : 'Assign a template...'}
                                  </option>
                                  {masterTemplates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                                {isCloning && (
                                  <span className="text-xs text-blue-400 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Cloning...
                                  </span>
                                )}
                              </div>

                              {loadingProgress === client.id ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 size={20} className="text-blue-400 animate-spin" />
                                </div>
                              ) : progress ? (
                                <>
                                  {/* Stats row */}
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {[
                                      { label: 'Completion', value: `${progress.globalCompletion}%`, color: progress.globalCompletion > 50 ? 'text-blue-400' : 'text-amber-400', icon: BarChart3 },
                                      { label: 'Fields Filled', value: `${progress.filledFields}/${progress.totalFields}`, color: 'text-purple-400', icon: FileText },
                                      { label: 'Sessions', value: progress.sessions.toString(), color: 'text-cyan-400', icon: MessageSquare },
                                      { label: 'Users', value: progress.users.toString(), color: 'text-emerald-400', icon: Users },
                                      { label: 'Last Activity', value: progress.lastActivity ? timeAgo(progress.lastActivity) : 'None', color: 'text-white/40', icon: Clock },
                                    ].map((stat) => (
                                      <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <stat.icon size={11} className="text-white/20" />
                                          <span className="text-[10px] text-white/25 uppercase tracking-wider">{stat.label}</span>
                                        </div>
                                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Track progress */}
                                  {progress.tracks.length > 0 && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Track Progress</p>
                                        <button
                                          onClick={() => refreshProgress(client.id)}
                                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                          <Activity size={10} /> Refresh
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {progress.tracks.map((track) => (
                                          <div key={track.id} className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-4">
                                            <div className="flex items-center gap-3">
                                              <ProgressRing percentage={track.completion} size={48} />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <h4 className="text-sm font-semibold text-white truncate">{track.name}</h4>
                                                  <span className="kea-badge kea-badge-blue text-[9px]">{track.code}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-white/30">
                                                  <span>{track.filledFields}/{track.totalFields} fields</span>
                                                  <span>{track.blockCount} blocks</span>
                                                  <span>{track.sessions} sessions</span>
                                                </div>
                                                <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                                                  <motion.div
                                                    className={`h-full rounded-full ${
                                                      track.completion < 25 ? 'bg-red-400' : track.completion < 50 ? 'bg-amber-400' : track.completion < 80 ? 'bg-blue-400' : 'bg-emerald-400'
                                                    }`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${track.completion}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Extract buttons */}
                                  <div className="flex items-center gap-3 pt-2">
                                    <button
                                      onClick={() => handleExtract(client.id, 'json')}
                                      disabled={extracting === client.id}
                                      className="kea-btn-primary text-sm flex items-center gap-2"
                                    >
                                      {extracting === client.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                      Extract JSON
                                    </button>
                                    <button
                                      onClick={() => handleExtract(client.id, 'csv')}
                                      disabled={extracting === client.id}
                                      className="kea-btn-secondary text-sm flex items-center gap-2"
                                    >
                                      <Download size={14} />
                                      Extract CSV
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-6">
                                  <BarChart3 size={24} className="text-white/10 mx-auto mb-2" />
                                  <p className="text-sm text-white/25">Assign a template to start tracking progress</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ═══ USERS TAB ═══ */}
                          {tab === 'users' && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                                  Client Users
                                </p>
                                <button
                                  onClick={() => setAddingUserTo(addingUserTo === client.id ? null : client.id)}
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                  <UserPlus size={12} /> Add User
                                </button>
                              </div>

                              {loadingUsers === client.id ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 size={16} className="text-blue-400 animate-spin" />
                                </div>
                              ) : users.length === 0 ? (
                                <p className="text-xs text-white/20 py-3">No users yet. Add users so they can log in and chat.</p>
                              ) : (
                                <div className="space-y-1">
                                  {users.map((u) => (
                                    <div key={u.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                                      <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-[10px] font-semibold text-blue-400 shrink-0">
                                        {u.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white/70">{u.full_name}</p>
                                        <p className="text-[10px] text-white/20">{timeAgo(u.created_at)}</p>
                                      </div>
                                      <span className={`kea-badge text-[9px] ${roleBadge[u.role] || 'kea-badge-green'}`}>
                                        {roleLabels[u.role] || u.role}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveUser(client.id, u.id)}
                                        className="w-6 h-6 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                      >
                                        <Trash2 size={10} className="text-red-400" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add user form */}
                              <AnimatePresence>
                                {addingUserTo === client.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[10px] text-white/30 mb-1">Full Name *</label>
                                          <input type="text" className="kea-input text-sm w-full" placeholder="John Smith"
                                            value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-white/30 mb-1">Email *</label>
                                          <input type="email" className="kea-input text-sm w-full" placeholder="user@company.com"
                                            value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-white/30 mb-1">Password *</label>
                                          <div className="relative">
                                            <input type={showNewPassword ? 'text' : 'password'} className="kea-input text-sm w-full pr-10"
                                              placeholder="Login password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
                                              {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] text-white/30 mb-1">Role</label>
                                          <select className="kea-input text-sm w-full" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                                            <option value="domain_expert">Domain Expert</option>
                                            <option value="manager">Manager</option>
                                            <option value="consultant">Consultant</option>
                                            <option value="viewer">Viewer</option>
                                            <option value="admin">Admin</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 justify-end">
                                        <button onClick={() => { setAddingUserTo(null); setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); }}
                                          className="kea-btn-secondary text-xs py-1.5 px-3">Cancel</button>
                                        <button onClick={() => handleAddUser(client.id)}
                                          disabled={!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || creatingUser}
                                          className="kea-btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-30">
                                          {creatingUser ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                          {creatingUser ? 'Creating...' : 'Create User'}
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
