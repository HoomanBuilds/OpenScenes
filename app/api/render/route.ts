import { NextRequest, NextResponse } from 'next/server';
import { validateTemplate, TemplateData } from '../../../lib/schemas/template';
import { queue, RenderJob } from '../../../lib/queue/adapter';
import { createJob } from '../../../lib/db/postgres';
import { checkRateLimits, getRateLimitHeaders, renderLimits } from '../../../lib/config/rate-limit';
import { validateRenderRequest, validateRenderParams } from '../../../lib/config/validation';

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimits(`render:${clientIp}`, renderLimits);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          exceeded: rateLimitResult.exceeded,
          remaining: rateLimitResult.remaining,
        },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let templateData: TemplateData;
    let rawBody = '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const templateFile = formData.get('template') as File | null;
      const templateJsonString = formData.get('templateJson') as string | null;
      
      if (templateFile) {
        rawBody = await templateFile.text();
        templateData = validateTemplate(JSON.parse(rawBody));
      } else if (templateJsonString) {
        rawBody = templateJsonString;
        templateData = validateTemplate(JSON.parse(templateJsonString));
      } else {
        throw new Error('No template provided. Send either "template" file or "templateJson" field.');
      }
    } else if (contentType.includes('application/json')) {
      rawBody = await req.text();
      templateData = validateTemplate(JSON.parse(rawBody));
    } else {
      throw new Error('Unsupported content type. Use multipart/form-data or application/json.');
    }
    
    const { searchParams } = new URL(req.url);
    const fps = parseInt(searchParams.get('fps') || '30', 10);
    const scale = parseFloat(searchParams.get('scale') || '1');
    const format = searchParams.get('format') || 'mp4';
    const quality = searchParams.get('quality') || 'high';

    const paramValidation = validateRenderParams({ fps, scale, format, quality });
    if (!paramValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: paramValidation.errors },
        { status: 400 }
      );
    }

    const requestValidation = validateRenderRequest(templateData, rawBody.length);
    if (!requestValidation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: requestValidation.errors },
        { status: 400 }
      );
    }

    const jobId = generateJobId();
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
         return NextResponse.json(
            { error: 'projectId is required' },
            { status: 400 }
         );
    }

    await createJob({
      jobId,
      projectId,
      templateName: templateData.name,
      format,
      quality,
      fps,
    });

    const renderJob: RenderJob = {
      jobId,
      templateData,
      fps,
      scale,
      format: format as 'mp4' | 'webm',
      quality: quality as 'low' | 'medium' | 'high' | 'ultra',
      createdAt: Date.now(),
    };

    await queue.publishRenderJob(renderJob);

    return NextResponse.json(
      {
        jobId,
        status: 'queued',
        message: 'Video render job queued successfully',
        statusUrl: `/api/video/${jobId}`,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Unknown error',
        hint: 'Check that your JSON template is valid and follows the expected schema.',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'OpenScenes Video Renderer',
    version: '2.0.0',
    description: 'Queue video generation from template JSON',
    endpoints: {
      POST: {
        url: '/api/render',
        params: {
          fps: 'number (1-120)',
          scale: 'number (0.1-2.0)',
          format: 'mp4 | webm',
          quality: 'low | medium | high | ultra'
        },
        body: 'multipart/form-data (template file) OR application/json',
        response: '{ jobId, status, statusUrl }'
      },
      status: {
        url: '/api/video/{jobId}',
        description: 'Check job status and get video URL when completed'
      }
    }
  });
}

