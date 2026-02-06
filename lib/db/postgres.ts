import { Pool } from 'pg';

const connectionString = (process.env.DATABASE_URL || 'postgresql://clarity:clarity_pass@127.0.0.1:5432/clarity').replace('localhost', '127.0.0.1');

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected client error', err);
});

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS render_jobs (
        job_id VARCHAR(64) PRIMARY KEY,
        project_id VARCHAR(64),
        status VARCHAR(20) NOT NULL DEFAULT 'queued',
        video_url TEXT,
        error TEXT,
        progress INTEGER DEFAULT 0,
        template_name VARCHAR(255),
        format VARCHAR(10),
        quality VARCHAR(20),
        fps INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Ensure project_id column exists for existing tables
    await client.query(`
      ALTER TABLE render_jobs ADD COLUMN IF NOT EXISTS project_id VARCHAR(64)
    `);
  } finally {
    client.release();
  }
}

export interface JobRow {
  job_id: string;
  project_id: string | null;
  status: string;
  video_url: string | null;
  error: string | null;
  progress: number;
  template_name: string | null;
  format: string | null;
  quality: string | null;
  fps: number | null;
  created_at: Date;
  updated_at: Date;
}

export async function getJob(jobId: string): Promise<JobRow | null> {
  const result = await pool.query<JobRow>(
    'SELECT * FROM render_jobs WHERE job_id = $1',
    [jobId]
  );
  return result.rows[0] || null;
}

export async function getProjectJobs(projectId: string): Promise<JobRow[]> {
  const result = await pool.query<JobRow>(
    'SELECT * FROM render_jobs WHERE project_id = $1 ORDER BY created_at DESC',
    [projectId]
  );
  return result.rows;
}

export async function createJob(data: {
  jobId: string;
  projectId: string;
  templateName: string;
  format: string;
  quality: string;
  fps: number;
}): Promise<void> {
  await pool.query(
    `INSERT INTO render_jobs (job_id, project_id, template_name, format, quality, fps, status) 
     VALUES ($1, $2, $3, $4, $5, $6, 'queued')`,
    [data.jobId, data.projectId, data.templateName, data.format, data.quality, data.fps]
  );
}

export async function updateJobStatus(
  jobId: string,
  status: string,
  extra?: { videoUrl?: string; error?: string; progress?: number }
): Promise<void> {
  const sets = ['status = $2', 'updated_at = NOW()'];
  const values: any[] = [jobId, status];
  let idx = 3;

  if (extra?.videoUrl !== undefined) {
    sets.push(`video_url = $${idx++}`);
    values.push(extra.videoUrl);
  }
  if (extra?.error !== undefined) {
    sets.push(`error = $${idx++}`);
    values.push(extra.error);
  }
  if (extra?.progress !== undefined) {
    sets.push(`progress = $${idx++}`);
    values.push(extra.progress);
  }

  await pool.query(
    `UPDATE render_jobs SET ${sets.join(', ')} WHERE job_id = $1`,
    values
  );
}

export { pool };
