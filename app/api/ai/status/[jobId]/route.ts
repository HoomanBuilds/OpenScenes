import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis/adapter';

const AI_JOB_PREFIX = 'ai:job:';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  const data = await redis.get(`${AI_JOB_PREFIX}${jobId}`);
  
  if (!data) {
    return NextResponse.json(
      { error: 'Job not found', jobId },
      { status: 404 }
    );
  }
  
  const job = JSON.parse(data);
  
  if (job.status === 'completed') {
    return NextResponse.json({
      status: 'completed',
      jobId,
      result: job.result,
    });
  }
  
  if (job.status === 'failed') {
    return NextResponse.json({
      status: 'failed',
      jobId,
      error: job.error,
    });
  }
  
  return NextResponse.json({
    status: job.status,
    jobId,
    message: job.status === 'processing' ? 'Generation in progress...' : 'Job queued',
  });
}
