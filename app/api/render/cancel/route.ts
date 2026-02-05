import { NextRequest, NextResponse } from 'next/server';
import { updateJobStatus, getJob } from '../../../../lib/db/postgres';

export async function POST(req: NextRequest) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Flag the job for cancellation using the error field
    // The worker will detect this 'USER_CANCEL_REQUEST' error and abort
    
    // Also publish to Redis for immediate worker interruptions
    const { redis } = require('../../../../lib/redis/adapter');
    await redis.publish('render:cancel', jobId);

    await updateJobStatus(jobId, 'cancelling', { 
        error: 'USER_CANCEL_REQUEST'
     });

    return NextResponse.json({ success: true, message: 'Cancellation requested' });
  } catch (error: any) {
    console.error('Cancel API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
