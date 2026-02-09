import cliProgress from 'cli-progress';
import colors from 'ansi-colors';

const symbols = {
  success: colors.green('✔'),
  error: colors.red('✖'),
  warning: colors.yellow('⚠'),
  info: colors.blue('ℹ'),
  bullet: colors.gray('•'),
};

class ProgressManager {
  private multibar: cliProgress.MultiBar;
  private bars: Map<string, cliProgress.SingleBar>;
  private originalLog: typeof console.log = console.log.bind(console);
  private originalError: typeof console.error = console.error.bind(console);

  constructor() {
    this.multibar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: '{jobId} |' + colors.cyan('{bar}') + '| {percentage}% | {status}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    }, cliProgress.Presets.shades_grey);
    
    this.bars = new Map();
  }

  createBar(jobId: string, total: number, startStatus: string) {
    const shortId = jobId.split('_')[1]?.substring(0, 8) || jobId.substring(0, 8);
    const bar = this.multibar.create(total, 0, {
      jobId: `Job ${shortId}`,
      status: startStatus
    });
    this.bars.set(jobId, bar);
    return bar;
  }

  updateBar(jobId: string, value: number, status?: string) {
    const bar = this.bars.get(jobId);
    if (bar) {
      if (status) {
        bar.update(value, { status });
      } else {
        bar.update(value);
      }
    }
  }

  removeBar(jobId: string) {
    const bar = this.bars.get(jobId);
    if (bar) {
      bar.stop();
      this.multibar.remove(bar);
      this.bars.delete(jobId);
    }
  }

  log(message: string) {
      this.multibar.log(message + '\n');
  }

  logRaw(message: string) {
      this.originalLog(message);
  }

  logErrorRaw(message: string) {
      this.originalError(colors.red('[Error] ') + message);
  }

  start() {
    this.originalLog('');
    this.originalLog(colors.bgBlue.white.bold(' RENDER WORKER ') + ' ' + colors.blue('Starting up...'));
    this.divider();
  }

  ready() {
    this.divider();
    this.originalLog(symbols.success + ' ' + colors.blue.bold('Worker Ready') + ' ' + colors.gray('Waiting for jobs...'));
    this.originalLog('');
  }

  connection(service: string, status: 'connecting' | 'connected' | 'error', details?: string) {
    if (status === 'connecting') {
      this.originalLog(symbols.bullet + ' Connecting to ' + colors.yellow(service) + '...');
    } else if (status === 'connected') {
      const detailStr = details ? colors.gray(` (${details})`) : '';
      this.originalLog(symbols.success + ' Connected to ' + colors.green(service) + detailStr);
    } else {
      const detailStr = details ? colors.gray(` (${details})`) : '';
      this.originalLog(symbols.error + ' Failed to connect to ' + colors.red(service) + detailStr);
    }
  }

  divider() {
    this.originalLog(colors.gray('─'.repeat(50)));
  }

  blank() {
    this.originalLog('');
  }

  stop() {
    this.multibar.stop();
  }

  captureConsole() {
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
          this.log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      };

      console.error = (...args) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
          
          // Ignore harmless browser disconnect errors
          if (msg.includes('ProtocolError') || msg.includes('Target closed') || msg.includes('Page.bringToFront')) {
              return;
          }

          this.log(colors.red('[Error] ') + msg);
      };
  }
}

export const progressManager = new ProgressManager();
