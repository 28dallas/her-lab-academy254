import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

const MAX_BYTES = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: 'File upload is not configured. Add Cloudinary env variables.' },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['teacher', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const courseId = (formData.get('courseId') as string) || 'general';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 });
  }

  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const resourceType =
    file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'raw' : 'auto';

  try {
    const result = await uploadToCloudinary(buffer, {
      folder: `courses/${courseId}`,
      resourceType,
      filename: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    });

    const fileSize =
      result.bytes < 1024 * 1024
        ? `${Math.round(result.bytes / 1024)} KB`
        : `${(result.bytes / (1024 * 1024)).toFixed(1)} MB`;

    return NextResponse.json({
      url: result.url,
      fileSize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
