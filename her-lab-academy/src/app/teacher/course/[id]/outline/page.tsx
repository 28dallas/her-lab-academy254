'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '@/app/actions/teacher';

interface ModuleRow {
  id: string;
  title: string;
  description: string | null;
  resourceCount: number;
}

function SortableModuleItem({
  module,
  courseId,
  onRefresh,
}: {
  module: ModuleRow;
  courseId: string;
  onRefresh: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: module.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? '');

  const handleUpdate = async () => {
    const fd = new FormData();
    fd.set('title', title);
    fd.set('description', description);
    await updateModule(courseId, module.id, fd);
    setEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this module and all its resources?')) return;
    await deleteModule(courseId, module.id);
    onRefresh();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden"
    >
      <div className="flex items-center p-4 bg-gray-50 border-b border-gray-100">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1 mr-2 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div
          className="flex-grow cursor-pointer flex items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          {editing ? (
            <div className="flex-1 space-y-2 mr-4" onClick={(e) => e.stopPropagation()}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs text-gray-600 px-3 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900">{module.title}</h3>
              <p className="text-sm text-gray-500">{module.description}</p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded">
              {module.resourceCount} resources
            </span>
            {expanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        <div className="flex items-center ml-4 space-x-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-blue-600"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
    const { data: mods } = await supabase
      .from('course_modules')
      .select('id, title, description, order_index')
      .eq('course_id', params.id)
      .order('order_index', { ascending: true });

    const rows: ModuleRow[] = [];
    for (const m of mods ?? []) {
      const { count } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', m.id);
      rows.push({
        id: m.id,
        title: m.title,
        description: m.description,
        resourceCount: count ?? 0,
      });
    }
    setModules(rows);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((item) => item.id === active.id);
    const newIndex = modules.findIndex((item) => item.id === over.id);
    const reordered = arrayMove(modules, oldIndex, newIndex);
    setModules(reordered);
    await reorderModules(
      params.id,
      reordered.map((m) => m.id)
    );
  }

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.set('title', newTitle);
    fd.set('description', newDesc);
    await createModule(params.id, fd);
    setNewTitle('');
    setNewDesc('');
    setShowAdd(false);
    load();
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Course Outline</h1>
          <p className="text-gray-600 mt-1">Drag and drop modules to reorder them.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md font-medium hover:bg-[#cf5626] shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Module
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddModule}
          className="bg-white border rounded-xl p-4 mb-6 space-y-3"
        >
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Module title"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm"
          >
            Create Module
          </button>
        </form>
      )}

      {modules.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <p className="text-gray-500">No modules yet. Add your first module to get started.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {modules.map((module) => (
              <SortableModuleItem
                key={module.id}
                module={module}
                courseId={params.id}
                onRefresh={load}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
