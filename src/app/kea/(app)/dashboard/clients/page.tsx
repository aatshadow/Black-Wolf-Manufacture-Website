'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Users,
  Database,
  ChevronRight,
  Loader2,
  Check,
  X,
  Trash2,
  UserPlus,
  Search,
  FileText,
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
}

interface ClientUser {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function ClientsPage() {
  const { organization } = useAuthStore();
  const [clients, setClients] = useState<ClientOrg[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [clientUsers, setClientUsers] = useState<Record<string, ClientUser[]>>({});
  const [loadingUsers, setLoadingUsers] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newIndustry, setNewIndustry] = useState('manufacturing');
  const [newLanguage, setNewLanguage] = useState('es');
  const [newTemplateId, setNewTemplateId] = useState('');
  const [creating, setCreating] = useState(false);

  // Add user form
  const [addingUserTo, setAddingUserTo] = useState<string | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('viewer');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchClients = useCallback(async () => {
    // Load all organizations (clients)
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
      .select('id, name, industry')
      .order('created_at', { ascending: false });
    if (data) setTemplates(data);
  }, []);

  useEffect(() => {
    fetchClients();
    fetchTemplates();
  }, [fetchClients, fetchTemplates]);

  const loadClientUsers = async (clientId: string) => {
    if (clientUsers[clientId]) return;
    setLoadingUsers(clientId);
    const { data } = await supabase
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .eq('organization_id', clientId)
      .order('created_at', { ascending: true });
    if (data) {
      setClientUsers((prev) => ({ ...prev, [clientId]: data }));
    }
    setLoadingUsers(null);
  };

  const toggleExpand = (clientId: string) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
    } else {
      setExpandedClient(clientId);
      loadClientUsers(clientId);
    }
  };

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
        active_template_id: newTemplateId || null,
      })
      .select('*')
      .single();

    if (!error && newOrg) {
      // If template selected, also assign it to the org
      if (newTemplateId) {
        await supabase
          .from('templates')
          .update({ organization_id: newOrg.id })
          .eq('id', newTemplateId);
      }
      setNewName('');
      setNewSlug('');
      setNewIndustry('manufacturing');
      setNewLanguage('es');
      setNewTemplateId('');
      setShowCreate(false);
      fetchClients();
    } else {
      alert(`Error: ${error?.message}`);
    }
    setCreating(false);
  };

  const handleAssignTemplate = async (clientId: string, templateId: string) => {
    await supabase
      .from('organizations')
      .update({ active_template_id: templateId || null })
      .eq('id', clientId);

    if (templateId) {
      await supabase
        .from('templates')
        .update({ organization_id: clientId })
        .eq('id', templateId);
    }

    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, active_template_id: templateId || null } : c))
    );
  };

  const handleAddUser = async (clientId: string) => {
    if (!newUserName.trim()) return;
    setCreatingUser(true);

    try {
      const res = await fetch('/api/kea/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newUserName.trim(),
          email: newUserEmail.trim() || undefined,
          password: newUserPassword.trim() || undefined,
          organizationId: clientId,
          role: newUserRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        // Reload users for this client
        const { data } = await supabase
          .from('user_profiles')
          .select('id, full_name, role, created_at')
          .eq('organization_id', clientId)
          .order('created_at', { ascending: true });
        if (data) setClientUsers((prev) => ({ ...prev, [clientId]: data }));
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('viewer');
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

  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    consultant: 'Consultant',
    domain_expert: 'Domain Expert',
    manager: 'Manager',
    viewer: 'Viewer',
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
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Create New Client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Client Name *</label>
                  <input
                    type="text"
                    className="kea-input text-sm w-full"
                    placeholder="Acme Manufacturing"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Slug *</label>
                  <input
                    type="text"
                    className="kea-input text-sm w-full font-mono"
                    placeholder="acme-manufacturing"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Industry</label>
                  <input
                    type="text"
                    className="kea-input text-sm w-full"
                    placeholder="manufacturing"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Language</label>
                  <select
                    className="kea-input text-sm w-full"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  >
                    <option value="es">Spanish</option>
                    <option value="en">English</option>
                    <option value="bg">Bulgarian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Assign Template</label>
                  <select
                    className="kea-input text-sm w-full"
                    value={newTemplateId}
                    onChange={(e) => setNewTemplateId(e.target.value)}
                  >
                    <option value="">No template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCreateClient}
                    disabled={!newName.trim() || !newSlug.trim() || creating}
                    className="kea-btn-primary text-sm w-full flex items-center justify-center gap-2 disabled:opacity-30"
                  >
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
            const assignedTemplate = templates.find((t) => t.id === client.active_template_id);

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
                    {assignedTemplate ? (
                      <span className="kea-badge kea-badge-blue text-[10px] flex items-center gap-1">
                        <FileText size={10} /> {assignedTemplate.name.slice(0, 30)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/20">No template</span>
                    )}
                    <ChevronRight
                      size={16}
                      className={`text-white/20 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
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
                      <div className="px-5 pb-5 pt-2 border-t border-white/[0.04] space-y-4">
                        {/* Template assignment */}
                        <div>
                          <label className="block text-xs text-white/40 mb-1.5">Assigned Template</label>
                          <select
                            className="kea-input text-sm w-full max-w-md"
                            value={client.active_template_id || ''}
                            onChange={(e) => handleAssignTemplate(client.id, e.target.value)}
                          >
                            <option value="">No template assigned</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} — {t.industry}</option>
                            ))}
                          </select>
                        </div>

                        {/* Users list */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                              Users ({users.length})
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
                            <p className="text-xs text-white/20 py-3">No users yet</p>
                          ) : (
                            <div className="space-y-1">
                              {users.map((u) => (
                                <div
                                  key={u.id}
                                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                                >
                                  <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-[10px] font-semibold text-blue-400 shrink-0">
                                    {u.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/70">{u.full_name}</p>
                                  </div>
                                  <span className={`kea-badge text-[9px] ${
                                    u.role === 'admin' ? 'kea-badge-red' : u.role === 'consultant' ? 'kea-badge-blue' : 'kea-badge-green'
                                  }`}>
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

                          {/* Add user inline form */}
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
                                      <label className="block text-[10px] text-white/30 mb-1">Name *</label>
                                      <input
                                        type="text"
                                        className="kea-input text-sm w-full"
                                        placeholder="Full Name"
                                        value={newUserName}
                                        onChange={(e) => setNewUserName(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-white/30 mb-1">Role</label>
                                      <select
                                        className="kea-input text-sm w-full"
                                        value={newUserRole}
                                        onChange={(e) => setNewUserRole(e.target.value)}
                                      >
                                        <option value="viewer">Viewer</option>
                                        <option value="domain_expert">Domain Expert</option>
                                        <option value="consultant">Consultant</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-white/30 mb-1">Email <span className="text-white/15">(optional)</span></label>
                                      <input
                                        type="email"
                                        className="kea-input text-sm w-full"
                                        placeholder="user@company.com"
                                        value={newUserEmail}
                                        onChange={(e) => setNewUserEmail(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-white/30 mb-1">Password <span className="text-white/15">(optional)</span></label>
                                      <input
                                        type="password"
                                        className="kea-input text-sm w-full"
                                        placeholder="Password for login"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 justify-end">
                                    <button
                                      onClick={() => setAddingUserTo(null)}
                                      className="kea-btn-secondary text-xs py-1.5 px-3"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleAddUser(client.id)}
                                      disabled={!newUserName.trim() || creatingUser}
                                      className="kea-btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-30"
                                    >
                                      {creatingUser ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                      {creatingUser ? 'Creating...' : 'Add User'}
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
