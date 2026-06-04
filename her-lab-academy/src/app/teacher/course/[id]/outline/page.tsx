'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { createModule, updateModule, deleteModule, reorderModules } from '@/app/actions/teacher';

interface ModuleRow { id: string; title: string; description: string | null; resourceCount: number; }

const inp = 'w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm bg-[var(--color-bg-muted)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]';

function SortableModuleItem({ module, courseId, onRefresh }: { module: ModuleRow; courseId: string; onRefresh: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? '');

  const handleUpdate = async () => {
    const fd = new FormData();
    fd.set('title', title); fd.set('description', description);
    await updateModule(courseId, module.id, fd);
    setEditing(false); onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this module and all its resources?')) return;
    await deleteModule(courseId, module.id); onRefresh();
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm mb-4 overflow-hidden">
      <div className="flex items-center p-4 bg-[var(--color-bg-muted)] border-b border-[var(--color-border)]">
        <div {...attributes} {...listeners} className="cursor-grab p-1 mr-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-grow cursor-pointer flex items-center justify-between" onClick={() => setExpanded(!expanded)}>
          {editing ? (
            <div className="flex-1 space-y-2 mr-4" onClick={(e) => e.stopPropagation()}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inp} />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={inp} />
              <div className="flex gap-2">
                <button type="button" onClick={handleUpdate} className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="text-xs text-[var(--color-text-muted)] px-3 py-1">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-[var(--color-text-dark)]">{module.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{module.description}</p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium bg-[var(--color-border)] text-[var(--color-text-muted)] px-2 py-1 rounded">{module.resourceCount} resources</span>
            {expanded ? <ChevronDown className="h-5 w-5 text-[var(--color-text-muted)]" /> : <ChevronRight className="h-5 w-5 text-[var(--color-text-muted)]" />}
          </div>
        </div>
        <div className="flex items-center ml-4 space-x-2">
          <button type="button" onClick={() => setEditing(true)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"><Edit2 className="h-4 w-4" /></button>
          <button type="button" onClick={handleDelete} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default function CourseOutlineBuilder({ params }: { params: { id: string } }) {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: mods } = await supabase.from('course_modules').select('id, title, description, order_index').eq('course_id', params.id).order('order_index', { ascending: true });
    const rows: ModuleRow[] = [];
    for (const m of mods ?? []) {
      const { count } = await supabase.from('resources').select('*', { count: 'exact', head: true }).eq('module_id', m.id);
      rows.push({ id: m.id, title: m.title, description: m.description, resourceCount: count ?? 0 });
    }
    setModules(rows); setLoading(false);
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = modules.findIndex((item) => item.id === active.id);
    const newIndex = modules.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);
    setModules(reordered);
    await reorderModules(params.id, reordered.map((m) => m.id));
  }

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.set('title', newTitle); fd.set('description', newDesc);
    await createModule(params.id, fd);
    setNewTitle(''); setNewDesc(''); setShowAdd(false); load();
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12 text-center text-[var(--color-text-muted)]">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Course Outline</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Drag and drop modules to reorder them.</p>
        </div>
        <button type="button" onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-hover)] shadow-sm">
          <Plus className="h-4 w-4" /> Add Module
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddModule} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-6 space-y-3">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Module title" required className={inp} />
          <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className={inp} />
          <button type="submit" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-[var(--color-primary-hover)]">Create Module</button>
        </form>
      )}

      {modules.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl">
          <p className="text-[var(--color-text-muted)]">No modules yet. Add your first module to get started.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((module) => <SortableModuleItem key={module.id} module={module} courseId={params.id} onRefresh={load} />)}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
