import { NextRequest, NextResponse } from 'next/server';
import { getProjectJobs } from '../../../../../lib/db/postgres';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const jobs = await getProjectJobs(projectId);

    return NextResponse.json({
        jobs: jobs.map(job => ({
            jobId: job.job_id,
            status: job.status,
            videoUrl: job.video_url,
            progress: job.progress,
            error: job.error,
            name: job.template_name || 'Untitled',
            createdAt: new Date(job.created_at).getTime(),
        }))
    });

  } catch (error: any) {
    console.error('Failed to fetch project jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project jobs' },
      { status: 500 }
    );
  }
}
