import { NextRequest, NextResponse } from 'next/server';
import { queue, AIJob } from '@/lib/queue/adapter';
import { redis } from '@/lib/redis/adapter';
import { checkAuth } from '@/lib/auth/api-middleware';

const AI_JOB_PREFIX = 'ai:job:';

function generateJobId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await checkAuth(request);
    if (!authResult.isAuthenticated) {
      return authResult.error;
    }

    const body = await request.json();
    
    if (!body.userQuery || typeof body.userQuery !== 'string') {
      return NextResponse.json(
        { error: 'userQuery is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!body.themeName || typeof body.themeName !== 'string') {
      return NextResponse.json(
        { error: 'themeName is required and must be a string' },
        { status: 400 }
      );
    }
    
    const jobId = generateJobId();
    
    const aiJob: AIJob = {
      jobId,
      type: 'generate',
      userQuery: body.userQuery,
      themeName: body.themeName,
      themePrompt: body.themePrompt,
      uploadedFileContent: body.fileContent,
      urlContent: body.urlContent,
      requestedSlideCount: body.slideCount,
      additionalInstructions: body.instructions,
      createdAt: Date.now(),
    };
    
    await redis.setex(
      `${AI_JOB_PREFIX}${jobId}`,
      3600,
      JSON.stringify({
        jobId,
        status: 'queued',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );
    
    await queue.publishAIJob(aiJob);
    
    console.log(`[API] Queued AI generate job: ${jobId}`);
    
    return NextResponse.json({
      success: true,
      jobId,
      statusUrl: `/api/ai/status/${jobId}`,
    });
    
  } catch (error) {
    console.error('[API] Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
