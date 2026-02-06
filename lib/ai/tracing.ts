let sdk: unknown = null;

export function initTracing(): void {
  if (sdk) return;
  
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com';
  
  if (!publicKey || !secretKey) {
    console.warn('[Tracing] Langfuse keys not configured, tracing disabled');
    return;
  }
  
  try {
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { LangfuseSpanProcessor } = require('@langfuse/otel');
    
    sdk = new NodeSDK({
      spanProcessors: [
        new LangfuseSpanProcessor({
          publicKey,
          secretKey,
          baseUrl,
        }),
      ],
    });
    
    (sdk as any).start();
    console.log('[Tracing] Langfuse tracing initialized');
  } catch (error) {
    console.warn('[Tracing] Failed to initialize (packages not installed):', error);
  }
}

export function shutdownTracing(): Promise<void> {
  if (!sdk) return Promise.resolve();
  return (sdk as any).shutdown();
}

export function isTracingEnabled(): boolean {
  return !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

export function getTelemetryConfig(operationName: string, metadata?: Record<string, string>) {
  return {
    isEnabled: isTracingEnabled(),
    functionId: operationName,
    metadata: {
      ...metadata,
      service: 'clarity-ai',
    },
  };
}
