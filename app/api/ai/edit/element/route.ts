import { NextRequest, NextResponse } from 'next/server';
import { queue, AIJob } from '@/lib/queue/adapter';
import { redis } from '@/lib/redis/adapter';
import type { SlideElement } from '@/lib/schemas/template';

const AI_JOB_PREFIX = 'ai:job:';

function generateJobId(): string {
  return `ai_element_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.slideId || typeof body.slideId !== 'string') {
      return NextResponse.json(
        { error: 'slideId is required' },
        { status: 400 }
      );
    }
    
    if (!body.elements || !Array.isArray(body.elements) || body.elements.length === 0) {
      return NextResponse.json(
        { error: 'elements array is required and must contain at least one element' },
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
      type: 'element-edit',
      userQuery: body.instruction,
      themeName: body.themeName,
      elementEditData: {
        slideId: body.slideId,
        elements: body.elements as SlideElement[],
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
    
    console.log(`[API] Queued AI element-edit job: ${jobId} with ${body.elements.length} elements`);
    
    return NextResponse.json({
      success: true,
      jobId,
      statusUrl: `/api/ai/status/${jobId}`,
    });
    
  } catch (error) {
    console.error('[API] Element edit error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
