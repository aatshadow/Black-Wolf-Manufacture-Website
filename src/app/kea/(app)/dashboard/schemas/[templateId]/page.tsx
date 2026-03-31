'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
  Save,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface TreeNode {
  id: string;
  name: string;
  type: 'track' | 'block' | 'field';
  children?: TreeNode[];
  code?: string;
  fieldType?: string;
  isRequired?: boolean;
  isBotCritical?: boolean;
}

const demoTree: TreeNode[] = [
  {
    id: 'track_a',
    name: 'Production & Product',
    type: 'track',
    code: 'track_a',
    children: [
      {
        id: 'product_families',
        name: 'Product Families',
        type: 'block',
        code: 'product_families',
        children: [
          { id: 'f1', name: 'Family Name', type: 'field', code: 'family_name', fieldType: 'text', isRequired: true, isBotCritical: true },
          { id: 'f2', name: 'Description', type: 'field', code: 'description', fieldType: 'text', isRequired: true },
          { id: 'f3', name: 'Subfamilies', type: 'field', code: 'subfamilies', fieldType: 'json', isRequired: true, isBotCritical: true },
          { id: 'f4', name: 'Typical Dimensions', type: 'field', code: 'typical_dimensions', fieldType: 'json', isRequired: true },
          { id: 'f5', name: 'Primary Materials', type: 'field', code: 'primary_materials', fieldType: 'multi_select', isRequired: true, isBotCritical: true },
        ],
      },
      {
        id: 'parts_anatomy',
        name: 'Parts Anatomy',
        type: 'block',
        code: 'parts_anatomy',
        children: [
          { id: 'f6', name: 'Part Name', type: 'field', code: 'part_name', fieldType: 'text', isRequired: true, isBotCritical: true },
          { id: 'f7', name: 'Part Type', type: 'field', code: 'part_type', fieldType: 'select', isRequired: true },
        ],
      },
    ],
  },
  {
    id: 'track_b',
    name: 'Management & Operations',
    type: 'track',
    code: 'track_b',
    children: [
      {
        id: 'sales_process',
        name: 'Sales Process',
        type: 'block',
        code: 'sales_process',
        children: [
          { id: 'f8', name: 'Sales Channels', type: 'field', code: 'sales_channels', fieldType: 'multi_select', isRequired: true, isBotCritical: true },
          { id: 'f9', name: 'Quote Process', type: 'field', code: 'quote_process', fieldType: 'text', isRequired: true },
        ],
      },
    ],
  },
];

function TreeItem({
  node,
  level,
  selected,
  onSelect,
}: {
  node: TreeNode;
  level: number;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selected === node.id;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left text-sm transition-all ${
          isSelected
            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
            : 'text-white/50 hover:bg-white/[0.03] hover:text-white/70 border border-transparent'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={14} className="shrink-0" />
          ) : (
            <ChevronRight size={14} className="shrink-0" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <span className="flex-1 truncate">{node.name}</span>

        {node.isBotCritical && (
          <span className="kea-badge kea-badge-amber text-[9px]">BOT MUST ASK</span>
        )}
        {node.isRequired && !node.isBotCritical && (
          <span className="text-red-400 text-xs">*</span>
        )}
        {node.fieldType && (
          <span className="text-[10px] text-white/20">{node.fieldType}</span>
        )}
      </button>

      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {node.children!.map((child) => (
              <TreeItem
                key={child.id}
                node={child}
                level={level + 1}
                selected={selected}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TemplateEditorPage() {
  const [selected, setSelected] = useState<string | null>('f1');

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/kea/dashboard/schemas"
            className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 className="text-base font-semibold text-white">
              ERP Discovery — Furniture Manufacturing
            </h2>
            <p className="text-xs text-white/25">Template Editor</p>
          </div>
        </div>
        <button className="kea-btn-primary flex items-center gap-2 text-sm">
          <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tree sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="kea-card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Schema Tree
              </p>
              <button className="text-white/25 hover:text-blue-400 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {demoTree.map((node) => (
                <TreeItem
                  key={node.id}
                  node={node}
                  level={0}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Editor panel */}
        <div className="lg:col-span-8 xl:col-span-9">
          <motion.div
            key={selected}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="kea-card p-6"
          >
            <h3 className="text-sm font-semibold text-white mb-1">Family Name</h3>
            <p className="text-xs text-white/25 mb-6">
              Field editor — configure how KEA asks about this field
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Field Name
                </label>
                <input className="kea-input" defaultValue="Family Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Field Code
                </label>
                <input className="kea-input" defaultValue="family_name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Field Type
                </label>
                <select className="kea-input" defaultValue="text">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                  <option value="multi_select">Multi Select</option>
                  <option value="json">JSON</option>
                  <option value="file">File</option>
                  <option value="date">Date</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Group Label
                </label>
                <input className="kea-input" defaultValue="Identity" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className="kea-input min-h-[80px] resize-none"
                  defaultValue="Name of the product family"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  Question Hint
                </label>
                <textarea
                  className="kea-input min-h-[80px] resize-none"
                  defaultValue="What do you call this type of furniture?"
                  placeholder="Suggested phrasing for the bot..."
                />
              </div>

              {/* Toggles */}
              <div className="md:col-span-2 flex items-center gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full bg-white/[0.06] peer-checked:bg-blue-600/40 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/30 peer-checked:translate-x-4 peer-checked:bg-blue-400 transition-all" />
                  </div>
                  <span className="text-sm text-white/50">
                    Required <span className="text-red-400">*</span>
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full bg-white/[0.06] peer-checked:bg-amber-600/40 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/30 peer-checked:translate-x-4 peer-checked:bg-amber-400 transition-all" />
                  </div>
                  <span className="text-sm text-white/50 flex items-center gap-1">
                    <AlertCircle size={12} className="text-amber-400" />
                    Bot Must Ask
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[0.04]">
              <button className="flex items-center gap-2 text-sm text-red-400/50 hover:text-red-400 transition-colors">
                <Trash2 size={14} /> Delete Field
              </button>
              <div className="flex gap-3">
                <button className="flex items-center gap-1 text-sm text-white/30 hover:text-white/60 transition-colors">
                  <GripVertical size={14} /> Reorder
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
