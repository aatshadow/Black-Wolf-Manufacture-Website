'use client';

import { motion } from 'framer-motion';
import {
  UserPlus,
  Shield,
  Mail,
  ChevronDown,
  Users,
  Pencil,
  Trash2,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

type Role = 'admin' | 'consultant' | 'viewer';

interface UserRecord {
  id: string;
  organization_id: string;
  full_name: string;
  role: string;
  language: string;
  track_access: string[];
  avatar_url: string | null;
  created_at: string;
}

const roleConfig: Record<string, { badge: string; label: string }> = {
  admin: { badge: 'kea-badge-red', label: 'Admin' },
  consultant: { badge: 'kea-badge-blue', label: 'Consultant' },
  viewer: { badge: 'kea-badge-green', label: 'Viewer' },
  domain_expert: { badge: 'kea-badge-amber', label: 'Domain Expert' },
  manager: { badge: 'kea-badge-blue', label: 'Manager' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function UsersPage() {
  const { organization } = useAuthStore();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<Role>('viewer');
  const [creating, setCreating] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRoleValue, setEditingRoleValue] = useState<string>('');

  const fetchUsers = useCallback(async () => {
    if (!organization) return;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setUsers(data as unknown as UserRecord[]);
    }
    setLoading(false);
  }, [organization]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreateUser() {
    if (!organization || !createName.trim()) return;
    setCreating(true);

    try {
      // All user creation goes through the API (creates auth user + profile)
      const res = await fetch('/api/kea/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail.trim() || undefined,
          password: createPassword.trim() || undefined,
          fullName: createName.trim(),
          organizationId: organization.id,
          role: createRole,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setCreateName('');
        setCreateEmail('');
        setCreatePassword('');
        setCreateRole('viewer');
        setShowCreateForm(false);
        fetchUsers();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
    setCreating(false);
  }

  async function handleChangeRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setEditingRoleId(null);
    }
  }

  async function handleRemoveUser(userId: string) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    // Delete profile first (cascade will handle), then auth user via API
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);
    if (!error) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      // Also delete auth user (fire-and-forget)
      fetch('/api/kea/create-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
            <Users size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">User Management</h2>
            <p className="text-xs text-white/30">
              {users.length} members
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="kea-btn-primary text-sm flex items-center gap-2"
        >
          <UserPlus size={14} /> Create User
        </button>
      </motion.div>

      {/* Create User Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="kea-card kea-glow-border p-6"
        >
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
            Create New User
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Full Name *</label>
              <input
                type="text"
                className="kea-input text-sm"
                placeholder="John Smith"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Email <span className="text-white/20">(optional)</span></label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  className="kea-input pl-9 text-sm"
                  placeholder="user@company.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Password <span className="text-white/20">(optional — for login)</span></label>
              <input
                type="password"
                className="kea-input text-sm"
                placeholder="••••••••"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Role</label>
              <div className="relative">
                <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <select
                  className="kea-input pl-9 text-sm appearance-none"
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as Role)}
                >
                  <option value="viewer">Viewer</option>
                  <option value="consultant">Consultant</option>
                  <option value="domain_expert">Domain Expert</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreateUser}
              disabled={!createName.trim() || creating}
              className="kea-btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-30"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="kea-card p-12 flex flex-col items-center justify-center"
        >
          <Users size={32} className="text-white/10 mb-3" />
          <p className="text-sm text-white/30">No users yet. Invite your first team member.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="kea-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Track Access</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const roleCfg = roleConfig[user.role] || { badge: 'kea-badge-blue', label: user.role };
                  const initials = user.full_name
                    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : '?';

                  return (
                    <motion.tr
                      key={user.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-xs font-semibold text-blue-400">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm text-white/70 font-medium">
                              {user.full_name || 'Unnamed'}
                            </p>
                            <p className="text-xs text-white/25">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {editingRoleId === user.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              className="kea-input text-xs py-1 px-2"
                              value={editingRoleValue}
                              onChange={(e) => setEditingRoleValue(e.target.value)}
                            >
                              <option value="viewer">Viewer</option>
                              <option value="consultant">Consultant</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleChangeRole(user.id, editingRoleValue)}
                              className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                            >
                              <Check size={10} className="text-emerald-400" />
                            </button>
                          </div>
                        ) : (
                          <span className={`kea-badge ${roleCfg.badge}`}>{roleCfg.label}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.track_access && user.track_access.length > 0 ? (
                            user.track_access.map((track) => (
                              <span key={track} className="text-xs text-white/30 bg-white/[0.04] px-2 py-0.5 rounded">
                                {track}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-white/15 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-white/30 flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(user.created_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRoleId(user.id);
                              setEditingRoleValue(user.role);
                            }}
                            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                            title="Edit Role"
                          >
                            <Pencil size={12} className="text-white/30" />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleRemoveUser(user.id)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={12} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
