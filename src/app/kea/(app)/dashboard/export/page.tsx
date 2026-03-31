'use client';

import { motion } from 'framer-motion';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Eye,
  CheckCircle2,
  Copy,
  Loader2,
  Rocket,
  AlertTriangle,
  Check,
  Server,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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

type ExportFormat = 'json' | 'csv';

interface InstanceWithBlock {
  id: string;
  instance_label: string;
  data: Record<string, unknown>;
  completeness_pct: number;
  status: string;
  created_at: string;
  block_id: string;
  schema_blocks: { name: string; code: string } | null;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function generateJSON(instances: InstanceWithBlock[], selected: Set<string>): string {
  const items = instances
    .filter((inst) => selected.has(inst.id))
    .map((inst) => ({
      instance: inst.instance_label,
      block: (inst.schema_blocks as unknown as { name: string } | null)?.name || 'Unknown',
      status: inst.status,
      completeness: inst.completeness_pct,
      data: inst.data,
    }));
  return JSON.stringify({ exported_at: new Date().toISOString(), instances: items }, null, 2);
}

function generateCSV(instances: InstanceWithBlock[], selected: Set<string>): string {
  const rows: string[] = ['Instance,Block,Field,Value,Status,Completeness'];
  instances
    .filter((inst) => selected.has(inst.id))
    .forEach((inst) => {
      const blockName = (inst.schema_blocks as unknown as { name: string } | null)?.name || 'Unknown';
      const entries = Object.entries(inst.data || {});
      if (entries.length === 0) {
        rows.push(`"${inst.instance_label}","${blockName}","","","${inst.status}",${inst.completeness_pct}`);
      } else {
        entries.forEach(([key, val]) => {
          const value = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
          rows.push(`"${inst.instance_label}","${blockName}","${key}","${value.replace(/"/g, '""')}","${inst.status}",${inst.completeness_pct}`);
        });
      }
    });
  return rows.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const { organization } = useAuthStore();
  const [instances, setInstances] = useState<InstanceWithBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Deploy state
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; industry: string }>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [deployClientName, setDeployClientName] = useState('');
  const [deployClientSlug, setDeployClientSlug] = useState('');
  const [deployPrimaryColor, setDeployPrimaryColor] = useState('#3B82F6');
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success: boolean;
    clientId?: string;
    created: { client: boolean; team: number; products: number; crmFields: number; pipeline: boolean };
    errors: string[];
  } | null>(null);

  const fetchInstances = useCallback(async () => {
    if (!organization) return;
    const { data, error } = await supabase
      .from('extraction_instances')
      .select('*, schema_blocks(name, code)')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      const typed = data as unknown as InstanceWithBlock[];
      setInstances(typed);
      if (typed.length > 0) {
        setSelectedIds(new Set([typed[0].id]));
      }
    }
    setLoading(false);
  }, [organization]);

  useEffect(() => {
    fetchInstances();
    // Load templates for deploy
    supabase
      .from('templates')
      .select('id, name, industry')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setTemplates(data);
          if (data.length > 0) setSelectedTemplate(data[0].id);
        }
      });
  }, [fetchInstances]);

  function toggleInstance(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const preview = format === 'json'
    ? generateJSON(instances, selectedIds)
    : generateCSV(instances, selectedIds);

  function handleDownload() {
    if (selectedIds.size === 0) return;
    const content = format === 'json'
      ? generateJSON(instances, selectedIds)
      : generateCSV(instances, selectedIds);
    const ext = format === 'json' ? 'json' : 'csv';
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    downloadFile(content, `kea-export-${Date.now()}.${ext}`, mime);
  }

  function handleCopy() {
    navigator.clipboard.writeText(preview).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDeploy() {
    if (!selectedTemplate || !organization || !deployClientName.trim() || !deployClientSlug.trim()) return;
    setDeploying(true);
    setDeployResult(null);
    try {
      const res = await fetch('/api/kea/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          organizationId: organization.id,
          clientConfig: {
            name: deployClientName.trim(),
            slug: deployClientSlug.trim(),
            primaryColor: deployPrimaryColor,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeployResult(data);
      } else {
        setDeployResult({ success: false, created: { client: false, team: 0, products: 0, crmFields: 0, pipeline: false }, errors: [data.error || 'Deploy failed'] });
      }
    } catch (err) {
      setDeployResult({ success: false, created: { client: false, team: 0, products: 0, crmFields: 0, pipeline: false }, errors: [String(err)] });
    } finally {
      setDeploying(false);
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
        <div>
          <h2 className="text-base font-semibold text-white">Export Data</h2>
          <p className="text-xs text-white/30 mt-0.5">
            Download extracted knowledge in your preferred format
          </p>
        </div>
      </motion.div>

      {instances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="kea-card p-12 flex flex-col items-center justify-center"
        >
          <Download size={32} className="text-white/10 mb-3" />
          <p className="text-sm text-white/30">No extraction instances to export</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Instance selector */}
            <div className="kea-card p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Select Instances
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {instances.map((inst, i) => {
                  const blockName = (inst.schema_blocks as unknown as { name: string } | null)?.name || 'Unknown Block';
                  return (
                    <motion.button
                      key={inst.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      onClick={() => toggleInstance(inst.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedIds.has(inst.id)
                          ? 'bg-blue-500/10 border border-blue-500/15'
                          : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70 font-medium">{inst.instance_label}</span>
                        {selectedIds.has(inst.id) && (
                          <CheckCircle2 size={14} className="text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-white/25 mt-1">
                        {blockName} &middot; {inst.completeness_pct}% complete &middot; {timeAgo(inst.created_at)}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Format selector */}
            <div className="kea-card p-5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Export Format
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('json')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    format === 'json'
                      ? 'bg-blue-500/10 border-blue-500/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <FileJson size={24} className={`mx-auto mb-2 ${format === 'json' ? 'text-blue-400' : 'text-white/25'}`} />
                  <p className={`text-sm font-medium ${format === 'json' ? 'text-blue-400' : 'text-white/40'}`}>JSON</p>
                </button>
                <button
                  onClick={() => setFormat('csv')}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    format === 'csv'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <FileSpreadsheet size={24} className={`mx-auto mb-2 ${format === 'csv' ? 'text-emerald-400' : 'text-white/25'}`} />
                  <p className={`text-sm font-medium ${format === 'csv' ? 'text-emerald-400' : 'text-white/40'}`}>CSV</p>
                </button>
              </div>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={selectedIds.size === 0}
              className="kea-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Download {format.toUpperCase()} ({selectedIds.size} selected)
            </button>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 kea-card p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-white/25" />
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Preview
                </h3>
                <span className="kea-badge kea-badge-blue">{format.toUpperCase()}</span>
              </div>
              <button
                onClick={handleCopy}
                className="kea-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex-1 rounded-xl bg-[#050510] border border-white/[0.04] p-4 overflow-auto font-mono text-xs max-h-[500px]">
              <pre className="text-white/50 whitespace-pre-wrap leading-relaxed">
                {selectedIds.size === 0 ? 'Select at least one instance to preview' : preview}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-white/20">
              <span>
                Estimated file size: {Math.ceil(new Blob([preview]).size / 1024)} KB
              </span>
              <span>
                {selectedIds.size} instance{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* Deploy to Blackwolf Central */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-600/10 border border-purple-500/20 flex items-center justify-center">
            <Rocket size={16} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Deploy to Blackwolf Central</h2>
            <p className="text-xs text-white/30">
              Create a fully configured client from extracted knowledge
            </p>
          </div>
        </div>

        <div className="kea-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Config */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="kea-input w-full"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.industry}
                    </option>
                  ))}
                  {templates.length === 0 && <option value="">No templates available</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={deployClientName}
                  onChange={(e) => {
                    setDeployClientName(e.target.value);
                    if (!deployClientSlug || deployClientSlug === deployClientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
                      setDeployClientSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                    }
                  }}
                  placeholder="Acme Corporation"
                  className="kea-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5">Client Slug</label>
                <input
                  type="text"
                  value={deployClientSlug}
                  onChange={(e) => setDeployClientSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="acme-corp"
                  className="kea-input w-full font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-1.5">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={deployPrimaryColor}
                    onChange={(e) => setDeployPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-white/[0.06] bg-transparent cursor-pointer"
                  />
                  <span className="text-sm text-white/50 font-mono">{deployPrimaryColor}</span>
                </div>
              </div>

              <button
                onClick={handleDeploy}
                disabled={deploying || !selectedTemplate || !deployClientName.trim() || !deployClientSlug.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {deploying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    Deploy to Blackwolf Central
                  </>
                )}
              </button>
            </div>

            {/* Right: What gets created + Result */}
            <div className="space-y-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                  What gets created
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    { icon: Server, label: 'Client record with theme & branding' },
                    { icon: CheckCircle2, label: 'Team members from extracted roles' },
                    { icon: CheckCircle2, label: 'Products from BOM & sales data' },
                    { icon: CheckCircle2, label: 'CRM custom fields (channels, payments, etc.)' },
                    { icon: CheckCircle2, label: 'Default CRM pipeline (7 stages)' },
                    { icon: CheckCircle2, label: 'Payment fees & commission config' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/40">
                      <item.icon size={14} className="text-purple-400/50 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy Result */}
              {deployResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 ${
                    deployResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {deployResult.success ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <AlertTriangle size={16} className="text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${deployResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {deployResult.success ? 'Deploy Successful' : 'Deploy Failed'}
                    </span>
                  </div>

                  {deployResult.success && (
                    <div className="space-y-1.5 text-xs text-white/50">
                      <p>Client ID: <span className="font-mono text-white/70">{deployResult.clientId}</span></p>
                      <p>{deployResult.created.team} team member{deployResult.created.team !== 1 ? 's' : ''} created</p>
                      <p>{deployResult.created.products} product{deployResult.created.products !== 1 ? 's' : ''} created</p>
                      <p>{deployResult.created.crmFields} CRM field{deployResult.created.crmFields !== 1 ? 's' : ''} created</p>
                      <p>Pipeline: {deployResult.created.pipeline ? 'Created' : 'Not created'}</p>
                    </div>
                  )}

                  {deployResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {deployResult.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-400/80">{err}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
