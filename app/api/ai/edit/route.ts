import { NextRequest, NextResponse } from 'next/server';
import { queue, AIJob } from '@/lib/queue/adapter';
import { redis } from '@/lib/redis/adapter';
import type { Slide } from '@/lib/schemas/template';
import { checkAuth } from '@/lib/auth/api-middleware';

const AI_JOB_PREFIX = 'ai:job:';

function generateJobId(): string {
  return `ai_edit_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const authResult = await checkAuth(request);

    if (!authResult.isAuthenticated) {
      return (
        authResult.error ??
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const body = await request.json();

    if (!body.slides || !Array.isArray(body.slides)) {
      return NextResponse.json(
        { error: 'slides array is required' },
        { status: 400 }
      );
    }

    if (!body.instruction || typeof body.instruction !== 'string') {
      return NextResponse.json(
        { error: 'instruction is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.themeName || typeof body.themeName !== 'string') {
      return NextResponse.json(
        { error: 'themeName is required' },
        { status: 400 }
      );
    }

    const jobId = generateJobId();

    const aiJob: AIJob = {
      jobId,
      type: 'edit',
      userQuery: body.instruction,
      themeName: body.themeName,
      existingSlides: body.slides as Slide[],
      editInstruction: body.instruction,
      previousMetadata: body.metadata,
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

    console.log(`[API] Queued AI edit job: ${jobId}`);

    return NextResponse.json({
      success: true,
      jobId,
      statusUrl: `/api/ai/status/${jobId}`,
    });

  } catch (error) {
    console.error('[API] Edit error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
