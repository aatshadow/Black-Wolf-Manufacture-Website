'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pencil,
  Save,
  Circle,
  FileText,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';
import type { ExtractionInstance, SchemaField } from '@/types/database';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

type FieldStatus = 'filled' | 'empty' | 'confirmed';
type FilterKey = 'all' | 'filled' | 'confirmed' | 'empty';

interface FieldWithHistory {
  id: string;
  code: string;
  name: string;
  field_type: string;
  is_required: boolean;
  value: unknown;
  status: FieldStatus;
  confidence: number;
  source: string;
}

interface HistoryRecord {
  field_code: string;
  source: string;
  confidence: number | null;
}

const statusConfig: Record<FieldStatus, { badge: string; label: string; icon: React.ElementType }> = {
  filled: { badge: 'kea-badge-blue', label: 'Filled', icon: Circle },
  empty: { badge: 'kea-badge-red', label: 'Empty', icon: XCircle },
  confirmed: { badge: 'kea-badge-green', label: 'Confirmed', icon: CheckCircle2 },
};

export default function InstanceDetailPage() {
  const params = useParams();
  const instanceId = params.instanceId as string;
  const { organization } = useAuthStore();

  const [instance, setInstance] = useState<ExtractionInstance | null>(null);
  const [blockName, setBlockName] = useState('');
  const [fields, setFields] = useState<FieldWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!instanceId) return;

    // Fetch instance with block info
    const { data: instData } = await supabase
      .from('extraction_instances')
      .select('*, schema_blocks(id, name, code)')
      .eq('id', instanceId)
      .single();

    if (!instData) {
      setLoading(false);
      return;
    }

    const inst = instData as unknown as ExtractionInstance & { schema_blocks: { id: string; name: string; code: string } | null };
    setInstance(inst);
    setBlockName((inst.schema_blocks as unknown as { name: string } | null)?.name || 'Unknown Block');

    const blockId = inst.block_id;

    // Fetch schema fields for the block
    const { data: fieldsData } = await supabase
      .from('schema_fields')
      .select('id, code, name, field_type, is_required, display_order')
      .eq('block_id', blockId)
      .order('display_order', { ascending: true });

    // Fetch extraction history for confidence/source
    const { data: historyData } = await supabase
      .from('extraction_history')
      .select('field_code, source, confidence')
      .eq('instance_id', instanceId)
      .order('created_at', { ascending: false });

    const historyMap: Record<string, HistoryRecord> = {};
    (historyData || []).forEach((h: HistoryRecord) => {
      if (!historyMap[h.field_code]) {
        historyMap[h.field_code] = h;
      }
    });

    const instanceData = (inst.data || {}) as Record<string, unknown>;

    const mappedFields: FieldWithHistory[] = (fieldsData || []).map((f: { id: string; code: string; name: string; field_type: string; is_required: boolean }) => {
      const value = instanceData[f.code];
      const history = historyMap[f.code];
      const isEmpty = value === null || value === undefined || value === '';
      const isConfirmed = history?.source === 'consultant_edit' || history?.source === 'user_correction';

      return {
        id: f.id,
        code: f.code,
        name: f.name,
        field_type: f.field_type,
        is_required: f.is_required,
        value: value ?? '',
        status: isEmpty ? 'empty' : isConfirmed ? 'confirmed' : 'filled',
        confidence: history?.confidence ?? (isEmpty ? 0 : 75),
        source: history?.source || (isEmpty ? '' : 'bot_extraction'),
      };
    });

    setFields(mappedFields);
    setLoading(false);
  }, [instanceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSaveEdit(fieldCode: string) {
    if (!instance || !organization) return;
    setSaving(true);

    const newData = { ...(instance.data as Record<string, unknown>), [fieldCode]: editValue };

    const { error } = await supabase
      .from('extraction_instances')
      .update({ data: newData, updated_at: new Date().toISOString() })
      .eq('id', instance.id);

    if (!error) {
      // Insert extraction history
      await supabase.from('extraction_history').insert({
        instance_id: instance.id,
        field_code: fieldCode,
        old_value: String(instance.data[fieldCode] ?? ''),
        new_value: editValue,
        source: 'consultant_edit',
        confidence: 100,
      });

      setInstance({ ...instance, data: newData });
      setFields((prev) =>
        prev.map((f) =>
          f.code === fieldCode
            ? { ...f, value: editValue, status: editValue ? 'confirmed' : 'empty', confidence: editValue ? 100 : 0, source: 'consultant_edit' }
            : f
        )
      );
    }
    setEditingCode(null);
    setSaving(false);
  }

  async function handleConfirmField(fieldCode: string) {
    if (!instance) return;
    await supabase.from('extraction_history').insert({
      instance_id: instance.id,
      field_code: fieldCode,
      old_value: String(fields.find((f) => f.code === fieldCode)?.value ?? ''),
      new_value: String(fields.find((f) => f.code === fieldCode)?.value ?? ''),
      source: 'consultant_edit',
      confidence: 100,
    });
    setFields((prev) =>
      prev.map((f) => (f.code === fieldCode ? { ...f, status: 'confirmed', confidence: 100, source: 'consultant_edit' } : f))
    );
  }

  async function handleRejectField(fieldCode: string) {
    if (!instance) return;
    const newData = { ...(instance.data as Record<string, unknown>), [fieldCode]: '' };
    await supabase
      .from('extraction_instances')
      .update({ data: newData, updated_at: new Date().toISOString() })
      .eq('id', instance.id);
    await supabase.from('extraction_history').insert({
      instance_id: instance.id,
      field_code: fieldCode,
      old_value: String(fields.find((f) => f.code === fieldCode)?.value ?? ''),
      new_value: '',
      source: 'consultant_edit',
      confidence: 0,
    });
    setInstance({ ...instance, data: newData });
    setFields((prev) =>
      prev.map((f) => (f.code === fieldCode ? { ...f, value: '', status: 'empty', confidence: 0 } : f))
    );
  }

  const filtered = statusFilter === 'all' ? fields : fields.filter((f) => f.status === statusFilter);

  const counts = {
    all: fields.length,
    filled: fields.filter((f) => f.status === 'filled').length,
    confirmed: fields.filter((f) => f.status === 'confirmed').length,
    empty: fields.filter((f) => f.status === 'empty').length,
  };

  function startEdit(field: FieldWithHistory) {
    setEditingCode(field.code);
    setEditValue(String(field.value ?? ''));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle size={24} className="text-amber-400/30 mb-3" />
        <p className="text-sm text-white/30">Instance not found</p>
        <Link href="/kea/dashboard" className="text-xs text-blue-400 mt-2 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href="/kea/dashboard"
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <ArrowLeft size={16} className="text-white/50" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Extraction Instance</h2>
            <span className="kea-badge kea-badge-blue">{instance.instance_label}</span>
          </div>
          <p className="text-xs text-white/30 mt-0.5">
            {counts.confirmed + counts.filled}/{counts.all} fields extracted &middot; Block: {blockName}
          </p>
        </div>
      </motion.div>

      {/* Status filter pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        {(
          [
            ['all', 'All'],
            ['filled', 'Filled'],
            ['confirmed', 'Confirmed'],
            ['empty', 'Empty'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === key
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </motion.div>

      {/* Data Table */}
      {fields.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="kea-card p-12 flex flex-col items-center justify-center"
        >
          <FileText size={32} className="text-white/10 mb-3" />
          <p className="text-sm text-white/30">No schema fields defined for this block</p>
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
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Field</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Value</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Conf.</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Source</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((field, i) => {
                  const cfg = statusConfig[field.status];
                  const StatusIcon = cfg.icon;
                  const isEditing = editingCode === field.code;

                  return (
                    <motion.tr
                      key={field.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm text-white/70">{field.name}</p>
                          <p className="text-[10px] text-white/20">{field.code}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 max-w-[260px]">
                        {isEditing ? (
                          <input
                            className="kea-input text-sm py-1.5 px-3"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(field.code)}
                          />
                        ) : (
                          <p className={`text-sm ${field.value ? 'text-white/60' : 'text-white/15 italic'}`}>
                            {field.value ? String(field.value) : 'No data'}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`kea-badge ${cfg.badge} flex items-center gap-1 w-fit`}>
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-mono ${
                            field.confidence >= 90
                              ? 'text-emerald-400'
                              : field.confidence >= 70
                                ? 'text-blue-400'
                                : field.confidence >= 50
                                  ? 'text-amber-400'
                                  : 'text-white/15'
                          }`}
                        >
                          {field.confidence > 0 ? `${field.confidence}%` : '\u2014'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs text-white/20">{field.source || '\u2014'}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(field.code)}
                              disabled={saving}
                              className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                            >
                              {saving ? (
                                <Loader2 size={12} className="text-emerald-400 animate-spin" />
                              ) : (
                                <Save size={12} className="text-emerald-400" />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => startEdit(field)}
                              className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                            >
                              <Pencil size={12} className="text-white/30" />
                            </button>
                          )}
                          {field.status === 'filled' && (
                            <button
                              onClick={() => handleConfirmField(field.code)}
                              className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle2 size={12} className="text-emerald-400" />
                            </button>
                          )}
                          {(field.status === 'filled') && (
                            <button
                              onClick={() => handleRejectField(field.code)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={12} className="text-red-400" />
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

      {/* Summary footer */}
      {fields.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="kea-card p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-white/25" />
              <span className="text-xs text-white/40">
                {counts.all} fields total
              </span>
            </div>
            <div className="h-4 w-px bg-white/[0.06]" />
            <span className="text-xs text-emerald-400">{counts.confirmed} confirmed</span>
            <span className="text-xs text-blue-400">{counts.filled} filled</span>
            <span className="text-xs text-red-400">{counts.empty} empty</span>
          </div>
          <span className="kea-badge kea-badge-blue">{instance.completeness_pct}% complete</span>
        </motion.div>
      )}
    </div>
  );
}
