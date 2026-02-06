
import { loadEnvFile } from 'node:process';
import path from 'path';

try {
  loadEnvFile(path.resolve(process.cwd(), '.env'));
} catch (e) {}

import { initDatabase, pool } from '../lib/db/postgres';
import { initAICallsTable } from '../lib/db/ai-calls';

async function main() {
  console.log('🔌 Connecting to database...');
  
  try {
    console.log('🛠️  Initializing core tables (render_jobs)...');
    await initDatabase();
    console.log('✅ Core tables ready.');
    
    console.log('🛠️  Initializing AI tables (ai_calls)...');
    await initAICallsTable();
    console.log('✅ AI tables ready.');
    
    console.log('✨ Database initialization complete!');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
