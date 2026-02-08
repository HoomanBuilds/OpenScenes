import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '../../../../lib/db/postgres';
import { checkAuth } from '../../../../lib/auth/api-middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const authResult = await checkAuth(req);
    if (!authResult.isAuthenticated) {
      return authResult.error;
    }

    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = await getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobId: job.job_id,
      status: job.status,
      progress: job.progress,
      videoUrl: job.video_url,
      error: job.error,
      templateName: job.template_name,
      format: job.format,
      quality: job.quality,
      fps: job.fps,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get job status' },
      { status: 500 }
    );
  }
}

