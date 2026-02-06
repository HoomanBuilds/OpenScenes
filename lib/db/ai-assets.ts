import { pool } from './postgres';

export interface AIAssetRow {
  id: string;
  job_id: string;
  asset_key: string;
  prompt: string;
  url: string;
  asset_type: string;
  width: number | null;
  height: number | null;
  created_at: Date;
}

export interface CreateAssetData {
  jobId: string;
  assetKey: string;
  prompt: string;
  url: string;
  assetType?: string;
  width?: number;
  height?: number;
}

export async function initAIAssetsTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id VARCHAR(64) NOT NULL,
        asset_key VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        url TEXT NOT NULL,
        asset_type VARCHAR(20) DEFAULT 'image',
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_assets_job_id ON ai_assets(job_id)
    `);
  } finally {
    client.release();
  }
}

export async function saveAsset(data: CreateAssetData): Promise<AIAssetRow> {
  const result = await pool.query<AIAssetRow>(
    `INSERT INTO ai_assets (job_id, asset_key, prompt, url, asset_type, width, height)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.jobId,
      data.assetKey,
      data.prompt,
      data.url,
      data.assetType || 'image',
      data.width || null,
      data.height || null,
    ]
  );
  return result.rows[0];
}

export async function saveAssetsBatch(assets: CreateAssetData[]): Promise<AIAssetRow[]> {
  if (assets.length === 0) return [];
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const results: AIAssetRow[] = [];
    for (const asset of assets) {
      const result = await client.query<AIAssetRow>(
        `INSERT INTO ai_assets (job_id, asset_key, prompt, url, asset_type, width, height)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          asset.jobId,
          asset.assetKey,
          asset.prompt,
          asset.url,
          asset.assetType || 'image',
          asset.width || null,
          asset.height || null,
        ]
      );
      results.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAssetsByJobId(jobId: string): Promise<AIAssetRow[]> {
  const result = await pool.query<AIAssetRow>(
    'SELECT * FROM ai_assets WHERE job_id = $1 ORDER BY created_at',
    [jobId]
  );
  return result.rows;
}

export async function getAssetsMapByJobId(jobId: string): Promise<Map<string, { url: string; prompt: string }>> {
  const assets = await getAssetsByJobId(jobId);
  const map = new Map<string, { url: string; prompt: string }>();
  
  for (const asset of assets) {
    map.set(asset.asset_key, {
      url: asset.url,
      prompt: asset.prompt,
    });
  }
  
  return map;
}

export async function deleteAssetsByJobId(jobId: string): Promise<void> {
  await pool.query('DELETE FROM ai_assets WHERE job_id = $1', [jobId]);
}
