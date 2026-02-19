import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/db/postgres';
import { objectStorage } from '@/lib/object-storage/adapter';
import { checkAuth } from '@/lib/auth/api-middleware';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        // 1. Check Auth (Optional but recommended)
        const authResult = await checkAuth(req);
        if (!authResult.isAuthenticated) {
            return authResult.error;
        }

        const { jobId } = await params;
        if (!jobId) {
            return new NextResponse('Job ID required', { status: 400 });
        }

        // 2. Get Job from DB
        const job = await getJob(jobId);
        if (!job || !job.video_url) {
            return new NextResponse('Video not found', { status: 404 });
        }

        // URL format: http://endpoint:port/bucket/key...
        // We need to extract bucket and key.
        // The worker uses: `${this.publicEndpoint}/${bucket}/${key}`
        // and key can contain slashes: `${job.jobId}/${safeName}.${format}`
        
        const url = new URL(job.video_url);
        const pathParts = url.pathname.split('/').filter(Boolean);
        
        if (pathParts.length < 2) {
            return new NextResponse('Invalid video path', { status: 500 });
        }

        const bucket = pathParts[0];
        const key = pathParts.slice(1).join('/');

        console.log(`[VideoServe] Attempting to fetch from bucket: ${bucket}, key: ${key}`);

        // 3. Get stream from MinIO
        process.stdout.write(`[VideoServe] Requesting stream from MinIO... `);
        const nodeStream = await objectStorage.getObject(bucket, key);
        console.log(`OK`);

        // Convert Node.js Readable to Web ReadableStream for Next.js
        const webStream = new ReadableStream({
            start(controller) {
                nodeStream.on('data', (chunk) => controller.enqueue(chunk));
                nodeStream.on('end', () => controller.close());
                nodeStream.on('error', (err) => controller.error(err));
            },
            cancel() {
                nodeStream.destroy();
            }
        });

        // 4. Return as Response
        const contentType = job.format === 'webm' ? 'video/webm' : 'video/mp4';
        
        console.log(`[VideoServe] Streaming video with content-type: ${contentType}`);

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${jobId}.${job.format}"`,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error: any) {
        console.error('[VideoServe] Error:', error);
        return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
    }
}
