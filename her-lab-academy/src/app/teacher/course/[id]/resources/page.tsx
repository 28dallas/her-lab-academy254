'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UploadCloud, FileText, Video, Link as LinkIcon, FileImage, Trash2, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/utils/supabase/client';
import { createResource, deleteResource } from '@/app/actions/teacher';

type ResourceType = 'pdf' | 'video' | 'doc' | 'link' | 'image' | 'text';
interface ModuleOption { id: string; title: string; }
interface ResourceRow { id: string; title: string; type: string; }
const FILE_TYPES: ResourceType[] = ['pdf', 'doc', 'image'];

const inp = 'w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-[var(--color-bg-muted)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-shadow';
const lbl = 'block text-sm font-medium text-[var(--color-text)] mb-1.5';

export default function ResourceUpload({ params }: { params: { id: string } }) {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [activeModule, setActiveModule] = useState('');
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [resourceType, setResourceType] = useState<ResourceType>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadModules = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from('course_modules').select('id, title').eq('course_id', params.id).order('order_index', { ascending: true });
    const list = data ?? [];
    setModules(list);
    if (list.length && !activeModule) setActiveModule(list[0].id);
    setLoading(false);
  }, [params.id, activeModule]);

  const loadResources = useCallback(async () => {
    if (!activeModule) { setResources([]); return; }
    const supabase = createClient();
    const { data } = await supabase.from('resources').select('id, title, type').eq('module_id', activeModule).order('order_index', { ascending: true });
    setResources(data ?? []);
  }, [activeModule]);

  useEffect(() => { loadModules(); }, [loadModules]);
  useEffect(() => { loadResources(); }, [loadResources]);

  const uploadFile = async (file: File) => {
    setUploading(true); setError('');
    const body = new FormData();
    body.append('file', file); body.append('courseId', params.id);
    const res = await fetch('/api/upload', { method: 'POST', body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? 'Upload failed'); return; }
    setUrl(data.url); setFileSize(data.fileSize ?? '');
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const onDrop = async (acceptedFiles: File[]) => { if (acceptedFiles[0]) await uploadFile(acceptedFiles[0]); };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: uploading || !FILE_TYPES.includes(resourceType), maxFiles: 1 });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!activeModule || !title.trim()) { setError('Select a module and enter a title.'); return; }
    if (resourceType !== 'text' && !url.trim()) { setError(FILE_TYPES.includes(resourceType) ? 'Upload a file first.' : 'Enter a URL.'); return; }
    const fd = new FormData();
    fd.set('moduleId', activeModule); fd.set('title', title); fd.set('type', resourceType);
    if (resourceType === 'text') fd.set('textContent', textContent);
    else { fd.set('url', url); if (fileSize) fd.set('fileSize', fileSize); }
    const result = await createResource(params.id, fd);
    if (result.error) { setError(result.error); return; }
    setTitle(''); setUrl(''); setTextContent(''); setFileSize('');
    loadResources();
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return;
    await deleteResource(params.id, resourceId); loadResources();
  };

  if (loading) return <div className="max-w-5xl mx-auto py-12 text-center text-[var(--color-text-muted)]">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Manage Resources</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Upload files (PDF, images, documents) or add links, videos, and text content.</p>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-xl">
          <p className="text-[var(--color-text-muted)]">Create modules in the Course Outline first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Select Module</h3>
            <div className="space-y-2">
              {modules.map((mod) => (
                <button key={mod.id} type="button" onClick={() => setActiveModule(mod.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeModule === mod.id ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'}`}>
                  {mod.title}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-[var(--color-text-dark)] mb-6">Add New Resource</h2>
              {error && <p className="alert-error mb-4">{error}</p>}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {([{ type: 'link', icon: LinkIcon, label: 'Link' }, { type: 'video', icon: Video, label: 'Video' }, { type: 'pdf', icon: FileText, label: 'PDF' }, { type: 'doc', icon: FileText, label: 'Document' }, { type: 'image', icon: FileImage, label: 'Image' }, { type: 'text', icon: FileText, label: 'Text' }] as const).map((item) => (
                    <button key={item.type} type="button" onClick={() => { setResourceType(item.type); setUrl(''); setFileSize(''); }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${resourceType === item.type ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50'}`}>
                      <item.icon className="h-4 w-4" />{item.label}
                    </button>
                  ))}
                </div>
                <div><label className={lbl}>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inp} /></div>
                {resourceType === 'text' ? (
                  <div><label className={lbl}>Content</label><textarea rows={6} value={textContent} onChange={(e) => setTextContent(e.target.value)} required className={`${inp} resize-y`} /></div>
                ) : FILE_TYPES.includes(resourceType) ? (
                  <div>
                    <label className={lbl}>Upload File</label>
                    <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'} ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                      <input {...getInputProps()} />
                      {uploading ? <Loader2 className="mx-auto h-10 w-10 text-[var(--color-primary)] animate-spin" /> : <UploadCloud className="mx-auto h-10 w-10 text-[var(--color-text-muted)] mb-3" />}
                      <p className="text-[var(--color-text-muted)] font-medium">{uploading ? 'Uploading...' : 'Drag & drop or click to upload'}</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1 opacity-60">Max 50MB</p>
                    </div>
                    {url && <p className="mt-2 text-xs text-green-400 truncate">✓ Uploaded: {url}</p>}
                  </div>
                ) : (
                  <div><label className={lbl}>URL</label><input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://..." className={inp} /></div>
                )}
                <button type="submit" disabled={uploading} className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50">Save Resource</button>
              </form>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-[var(--color-text-dark)] mb-4">Existing Resources</h3>
              {resources.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No resources in this module.</p>
              ) : (
                <ul className="space-y-2">
                  {resources.map((r) => (
                    <li key={r.id} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-muted)]">
                      <span className="text-sm font-medium text-[var(--color-text)]">{r.title} <span className="text-[var(--color-text-muted)] uppercase text-xs">({r.type})</span></span>
                      <button type="button" onClick={() => handleDelete(r.id)} className="text-[var(--color-text-muted)] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
