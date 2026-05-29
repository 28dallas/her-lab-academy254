'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  PlayCircle,
  Link as LinkIcon,
  FileImage,
  CheckCircle2,
  Download,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { markResourceViewed } from '@/app/actions/student';

interface Resource {
  id: string;
  type: 'pdf' | 'video' | 'doc' | 'link' | 'image' | 'text';
  title: string;
  file_size?: string | null;
  url?: string | null;
  text_content?: string | null;
  viewed: boolean;
}

const typeIcon: Record<Resource['type'], React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-red-500" />,
  video: <PlayCircle className="w-5 h-5 text-purple-500" />,
  doc: <FileText className="w-5 h-5 text-blue-500" />,
  link: <LinkIcon className="w-5 h-5 text-gray-500" />,
  image: <FileImage className="w-5 h-5 text-green-500" />,
  text: <FileText className="w-5 h-5 text-orange-400" />,
};

const typeLabel: Record<Resource['type'], string> = {
  pdf: 'PDF',
  video: 'Video',
  doc: 'Document',
  link: 'Link',
  image: 'Image',
  text: 'Text',
};

export default function ModuleDetailPage({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedText, setExpandedText] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: mod } = await supabase
      .from('course_modules')
      .select('title, description')
      .eq('id', params.moduleId)
      .eq('course_id', params.id)
      .single();

    if (!mod) {
      setLoading(false);
      return;
    }

    setModuleTitle(mod.title);
    setModuleDescription(mod.description ?? '');

    const { data: resRows } = await supabase
      .from('resources')
      .select('id, type, title, file_size, url, text_content')
      .eq('module_id', params.moduleId)
      .order('order_index', { ascending: true });

    let viewedIds = new Set<string>();
    if (user && resRows?.length) {
      const { data: progress } = await supabase
        .from('student_progress')
        .select('resource_id')
        .eq('student_id', user.id)
        .in(
          'resource_id',
          resRows.map((r) => r.id)
        );
      viewedIds = new Set((progress ?? []).map((p) => p.resource_id));
    }

    setResources(
      (resRows ?? []).map((r) => ({
        id: r.id,
        type: r.type as Resource['type'],
        title: r.title,
        file_size: r.file_size,
        url: r.url,
        text_content: r.text_content,
        viewed: viewedIds.has(r.id),
      }))
    );
    setLoading(false);
  }, [params.id, params.moduleId, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkViewed = async (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, viewed: true } : r))
    );
    await markResourceViewed(params.id, resourceId);
  };

  const viewed = resources.filter((r) => r.viewed).length;
  const total = resources.length;
  const pct = total === 0 ? 0 : Math.round((viewed / total) * 100);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto pb-12 text-center py-20 text-gray-500">
        Loading module...
      </div>
    );
  }

  if (!moduleTitle) {
    return (
      <div className="max-w-3xl mx-auto pb-12 text-center py-20">
        <p className="text-gray-500">Module not found.</p>
        <Link
          href={`/dashboard/course/${params.id}`}
          className="mt-4 inline-block text-[var(--color-primary)] hover:underline"
        >
          Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link
        href={`/dashboard/course/${params.id}`}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course
      </Link>

      <div className="bg-[var(--color-secondary)] rounded-2xl p-6 text-white mb-8 shadow-md">
        <h1 className="text-2xl font-display font-bold mb-2">{moduleTitle}</h1>
        {moduleDescription && (
          <p className="text-white/80 text-sm mb-4">{moduleDescription}</p>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-[var(--color-primary)] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-semibold">
            {viewed}/{total} done
          </span>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-500">No resources in this module yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((res) => (
            <div
              key={res.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-colors ${
                res.viewed ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-shrink-0">
                  {res.viewed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-shrink-0">{typeIcon[res.type]}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate ${res.viewed ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    {res.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                      {typeLabel[res.type]}
                    </span>
                    {res.file_size && (
                      <span className="text-xs text-gray-400">· {res.file_size}</span>
                    )}
                  </div>
                </div>
                {res.type === 'text' ? (
                  <button
                    onClick={() => {
                      setExpandedText(expandedText === res.id ? null : res.id);
                      if (!res.viewed) handleMarkViewed(res.id);
                    }}
                    className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  >
                    {expandedText === res.id ? 'Collapse' : 'Read'}
                  </button>
                ) : res.url ? (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => !res.viewed && handleMarkViewed(res.id)}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  >
                    {res.type === 'link' || res.type === 'video' ? (
                      <>
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> View
                      </>
                    )}
                  </a>
                ) : null}
              </div>
              {res.type === 'text' && expandedText === res.id && (
                <div className="border-t border-gray-100 px-5 py-4 bg-[var(--color-accent)]">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {res.text_content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pct === 100 && total > 0 && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-900">Module complete!</p>
            <p className="text-sm text-green-700 mt-0.5">
              All resources reviewed. Head back to continue the course.
            </p>
          </div>
          <Link
            href={`/dashboard/course/${params.id}`}
            className="ml-auto text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex-shrink-0"
          >
            Back to Course
          </Link>
        </div>
      )}
    </div>
  );
}
