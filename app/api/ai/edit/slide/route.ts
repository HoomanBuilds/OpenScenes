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
    
    if (!body.slideId || typeof body.slideId !== 'string') {
      return NextResponse.json(
        { error: 'slideId is required' },
        { status: 400 }
      );
    }
    
    if (!body.slide || typeof body.slide !== 'object') {
      return NextResponse.json(
        { error: 'slide object is required' },
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
      type: 'slide-edit',
      userQuery: body.instruction,
      themeName: body.themeName,
      slideEditData: {
        slideId: body.slideId,
        slide: body.slide as Slide,
        instruction: body.instruction,
        themePrompt: body.themePrompt,
        projectSummary: body.projectSummary,
      },
      createdAt: Date.now(),
    };
    
    // Store initial status
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
    
    // Publish to queue
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
