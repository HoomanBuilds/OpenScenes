import { NextRequest, NextResponse } from 'next/server';
import { queue, AIJob } from '@/lib/queue/adapter';
import { redis } from '@/lib/redis/adapter';
import type { Slide } from '@/lib/schemas/template';

const AI_JOB_PREFIX = 'ai:job:';

function generateJobId(): string {
  return `ai_slide_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      slideId, 
      slide, 
      instruction, 
      themeName, 
      themePrompt, 
      projectSummary, 
      history, 
      selectedElementIds 
    } = body;

    if (!slideId || typeof slideId !== 'string') {
      return NextResponse.json({ error: 'slideId is required' }, { status: 400 });
    }
    
    if (!slide || typeof slide !== 'object') {
      return NextResponse.json({ error: 'slide object is required' }, { status: 400 });
    }
    
    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json({ error: 'instruction is required' }, { status: 400 });
    }
    
    if (!themeName || typeof themeName !== 'string') {
      return NextResponse.json({ error: 'themeName is required' }, { status: 400 });
    }
    
    const jobId = generateJobId();
    
    const aiJob: AIJob = {
      jobId,
      type: 'slide-edit',
      userQuery: instruction,
      themeName,
      slideEditData: {
        slideId,
        slide: slide as Slide,
        instruction,
        themePrompt: themePrompt || themeName,
        projectSummary,
        history: history || [],
        selectedElementIds: selectedElementIds || []
      },
      createdAt: Date.now(),
    };

    // Store initial status in Redis (ignore errors if Redis is down for local dev)
    try {
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
    } catch (redisError) {
      console.warn('[API] Redis failed to store job status:', redisError instanceof Error ? redisError.message : String(redisError));
      // Continue anyway, RabbitMQ is the source of truth for execution
    }
    
    // Publish to RabbitMQ
    await queue.publishAIJob(aiJob);
    
    console.log(`[API] Queued AI slide-edit job: ${jobId}`);
    
    return NextResponse.json({
      success: true,
      jobId,
      statusUrl: `/api/ai/status/${jobId}`,
    });
    
  } catch (error) {
    console.error('[API] Slide edit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
