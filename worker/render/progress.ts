import cliProgress from 'cli-progress';
import colors from 'ansi-colors';

class ProgressManager {
  private multibar: cliProgress.MultiBar;
  private bars: Map<string, cliProgress.SingleBar>;

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
