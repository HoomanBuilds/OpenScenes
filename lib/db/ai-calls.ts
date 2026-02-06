import { pool } from './postgres';

export async function initAICallsTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_calls (
        id SERIAL PRIMARY KEY,
        job_id VARCHAR(64),
        trace_id VARCHAR(64),
        agent_type VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        operation VARCHAR(50) NOT NULL,
        input_tokens INTEGER,
        output_tokens INTEGER,
        total_tokens INTEGER,
        latency_ms INTEGER,
        status VARCHAR(20) NOT NULL DEFAULT 'success',
        error TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_calls_job_id ON ai_calls(job_id)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_calls_agent_type ON ai_calls(agent_type)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_calls_created_at ON ai_calls(created_at)
    `);
    
    // console.log('[DB] ai_calls table initialized');
  } finally {
    client.release();
  }
}

export interface AICallRecord {
  jobId?: string;
  traceId?: string;
  agentType: string;
  model: string;
  operation: 'generate_text' | 'generate_structured' | 'generate_json' | 'generate_image' | 'validate' | 'repair';
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  latencyMs: number;
  status: 'success' | 'error' | 'fallback';
  error?: string;
  metadata?: Record<string, unknown>;
}

export async function logAICall(record: AICallRecord): Promise<number> {
  const result = await pool.query(
    `INSERT INTO ai_calls (
      job_id, trace_id, agent_type, model, operation,
      input_tokens, output_tokens, total_tokens,
      latency_ms, status, error, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id`,
    [
      record.jobId || null,
      record.traceId || null,
      record.agentType,
      record.model,
      record.operation,
      record.inputTokens || null,
      record.outputTokens || null,
      record.totalTokens || null,
      record.latencyMs,
      record.status,
      record.error || null,
      record.metadata ? JSON.stringify(record.metadata) : null,
    ]
  );
  
  return result.rows[0].id;
}

export interface AICallStats {
  totalCalls: number;
  totalTokens: number;
  avgLatencyMs: number;
  successRate: number;
  callsByAgent: Record<string, number>;
}

export async function getAICallStats(
  startDate?: Date,
  endDate?: Date
): Promise<AICallStats> {
  const whereClause = startDate && endDate 
    ? 'WHERE created_at BETWEEN $1 AND $2' 
    : '';
  const params = startDate && endDate ? [startDate, endDate] : [];
  
  const statsResult = await pool.query(`
    SELECT 
      COUNT(*) as total_calls,
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(AVG(latency_ms), 0) as avg_latency,
      COUNT(CASE WHEN status = 'success' THEN 1 END)::float / NULLIF(COUNT(*), 0) as success_rate
    FROM ai_calls ${whereClause}
  `, params);
  
  const agentResult = await pool.query(`
    SELECT agent_type, COUNT(*) as count
    FROM ai_calls ${whereClause}
    GROUP BY agent_type
  `, params);
  
  const callsByAgent: Record<string, number> = {};
  for (const row of agentResult.rows) {
    callsByAgent[row.agent_type] = parseInt(row.count, 10);
  }
  
  const stats = statsResult.rows[0];
  return {
    totalCalls: parseInt(stats.total_calls, 10),
    totalTokens: parseInt(stats.total_tokens, 10),
    avgLatencyMs: Math.round(parseFloat(stats.avg_latency)),
    successRate: parseFloat(stats.success_rate) || 0,
    callsByAgent,
  };
}

export async function getJobAICalls(jobId: string): Promise<AICallRecord[]> {
  const result = await pool.query(
    `SELECT * FROM ai_calls WHERE job_id = $1 ORDER BY created_at`,
    [jobId]
  );
  
  return result.rows.map(row => ({
    jobId: row.job_id,
    traceId: row.trace_id,
    agentType: row.agent_type,
    model: row.model,
    operation: row.operation,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    totalTokens: row.total_tokens,
    latencyMs: row.latency_ms,
    status: row.status,
    error: row.error,
    metadata: row.metadata,
  }));
}
