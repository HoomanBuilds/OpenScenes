import c from 'ansi-colors';
import fs from 'fs/promises';
import path from 'path';
import { AI_CONFIG } from './config';

const symbols = {
  success: c.green('✔'),
  error: c.red('✖'),
  warning: c.yellow('⚠'),
  info: c.blue('ℹ'),
  arrow: c.cyan('→'),
  bullet: c.gray('•'),
  star: c.yellow('★'),
  rocket: '🚀',
  brain: '🧠',
  art: '🎨',
  check: '✓',
  sparkle: '✨',
};

const themes = {
  worker: c.magenta.bold,
  pipeline: c.cyan.bold,
  director: c.blue.bold,
  generator: c.green.bold,
  asset: c.yellow.bold,
  adapter: c.gray.bold,
  validator: c.white.bold,
  summarizer: c.blueBright.bold,
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export const logger = {
  debug: {
    log: async (jobId: string, filename: string, data: unknown) => {
      if (!AI_CONFIG.debug) return;
      
      try {
        const logDir = path.join(process.cwd(), 'logs', 'ai-logs', jobId);
        await fs.mkdir(logDir, { recursive: true });
        
        await fs.writeFile(
          path.join(logDir, `${filename}.json`),
          JSON.stringify(data, null, 2)
        );
      } catch (error) {
      }
    },
    prompt: async (jobId: string, step: string, promptContent: string, systemPrompt?: string) => {
      if (!AI_CONFIG.debug) return;
      
      try {
        const logsDir = path.join(process.cwd(), 'logs', 'ai-logs', jobId);
        await fs.mkdir(logsDir, { recursive: true });
        
        const fullContent = systemPrompt 
          ? `### SYSTEM PROMPT ###\n${systemPrompt}\n\n### USER PROMPT ###\n${promptContent}`
          : promptContent;

        await fs.writeFile(
          path.join(logsDir, `${step}.prompt`),
          fullContent
        );
      } catch (error) {
      }
    }
  },

  worker: {
    start: () => {
      console.log('');
      console.log(c.bgMagenta.white.bold(' AI WORKER ') + ' ' + c.magenta('Starting up...'));
      console.log(c.gray('─'.repeat(50)));
    },
    
    ready: () => {
      console.log(c.gray('─'.repeat(50)));
      console.log(symbols.success + ' ' + themes.worker('Worker Ready') + ' ' + c.gray('Waiting for jobs...'));
      console.log('');
    },
    
    jobStart: (jobId: string, type: string, query: string) => {
      console.log('');
      console.log(c.bgBlue.white.bold(' NEW JOB ') + ' ' + c.blue(jobId));
      console.log(symbols.bullet + ' Type: ' + c.white(type));
      console.log(symbols.bullet + ' Query: ' + c.white(`"${query.slice(0, 60)}${query.length > 60 ? '...' : ''}"`));
      console.log('');
    },
    
    jobComplete: (jobId: string, slideCount: number, durationMs: number) => {
      console.log('');
      console.log(c.bgGreen.white.bold(' COMPLETE ') + ' ' + c.green(jobId));
      console.log(symbols.success + ' Generated ' + c.green.bold(String(slideCount)) + ' slides in ' + c.cyan(formatDuration(durationMs)));
      console.log('');
    },
    
    jobError: (jobId: string, error: string) => {
      console.log('');
      console.log(c.bgRed.white.bold(' ERROR ') + ' ' + c.red(jobId));
      console.log(symbols.error + ' ' + c.red(error));
      console.log('');
    },
    
    env: (project: string, location: string) => {
      console.log(symbols.info + ' Vertex Project: ' + c.cyan(project));
      console.log(symbols.info + ' Location: ' + c.cyan(location));
    },
    
    connection: (service: string, status: 'connecting' | 'connected' | 'error', details?: string) => {
      if (status === 'connecting') {
        console.log(symbols.bullet + ' Connecting to ' + c.yellow(service) + '...');
      } else if (status === 'connected') {
        const detailStr = details ? c.gray(` (${details})`) : '';
        console.log(symbols.success + ' Connected to ' + c.green(service) + detailStr);
      } else {
        const detailStr = details ? c.gray(` (${details})`) : '';
        console.log(symbols.error + ' Failed to connect to ' + c.red(service) + detailStr);
      }
    },
  },

  pipeline: {
    start: (theme: string) => {
      console.log(symbols.rocket + ' ' + themes.pipeline('Pipeline') + ' Starting with theme: ' + c.cyan(theme));
    },
    
    phase: (name: string, detail?: string) => {
      const detailStr = detail ? c.gray(` (${detail})`) : '';
      console.log('   ' + symbols.arrow + ' ' + c.white(name) + detailStr);
    },
    
    complete: (slideCount: number) => {
      console.log(symbols.sparkle + ' ' + themes.pipeline('Pipeline') + ' Complete: ' + c.green.bold(String(slideCount)) + ' slides');
    },
  },

  director: {
    planning: (theme: string) => {
      console.log(symbols.brain + ' ' + themes.director('Director') + ' Planning presentation...');
    },
    
    planned: (slides: number, batches: number, arc: string[]) => {
      console.log('   ' + symbols.success + ' Planned ' + c.blue.bold(String(slides)) + ' slides in ' + c.blue(String(batches)) + ' batch(es)');
      console.log('   ' + symbols.bullet + ' Arc: ' + c.gray(arc.join(' → ')));
    },
  },

  asset: {
    generating: (count: number) => {
      console.log(symbols.art + ' ' + themes.asset('Assets') + ' Generating ' + c.yellow.bold(String(count)) + ' assets...');
    },
    
    generated: (key: string, success: boolean) => {
      const status = success ? c.green('✓') : c.yellow('~');
      console.log('   ' + status + ' ' + c.gray(key.slice(0, 40)));
    },
    
    complete: (success: number, fallback: number) => {
      console.log('   ' + symbols.success + ' ' + c.green(String(success)) + ' generated' + (fallback > 0 ? ', ' + c.yellow(String(fallback)) + ' fallback' : ''));
    },
  },

  generator: {
    generating: (count: number, batch: number, total: number) => {
      console.log(symbols.sparkle + ' ' + themes.generator('Generator') + ' Batch ' + c.green(`${batch}/${total}`) + ': ' + c.green.bold(String(count)) + ' slides');
    },
    
    generated: (count: number) => {
      // console.log('   ' + symbols.success + ' Generated ' + c.green.bold(String(count)) + ' valid slides');
    },
  },

  summarizer: {
    summarizing: () => {
      console.log('   ' + symbols.arrow + ' Summarizing content...');
    },
    
    complete: (topic: string) => {
      console.log('   ' + symbols.success + ' Topic: ' + c.blue(`"${topic}"`));
    },
    
    skipped: (reason: string) => {
      console.log('   ' + symbols.bullet + ' ' + c.gray(reason));
    },
  },

  adapter: {
    init: (project: string, location: string) => {
      console.log(symbols.info + ' ' + themes.adapter('Vertex AI') + ' ' + c.gray(`${project} @ ${location}`));
    },
  },

  validator: {
    validating: () => {
      console.log('   ' + symbols.arrow + ' Validating slides...');
    },
    
    valid: () => {
      console.log('   ' + symbols.success + ' All slides valid');
    },
    
    fixed: (count: number) => {
      console.log('   ' + symbols.warning + ' Auto-fixed ' + c.yellow(String(count)) + ' issues');
    },
  },

  divider: () => {
    console.log(c.gray('─'.repeat(50)));
  },

  blank: () => {
    console.log('');
  },
};

export default logger;
