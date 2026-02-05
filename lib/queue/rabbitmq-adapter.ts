import amqp from 'amqplib';
import { QueueAdapter, RenderJob } from './types';

const QUEUE_NAME = 'video-render';

class RabbitMQAdapter implements QueueAdapter {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
    
    let retries = 5;
    while (retries > 0) {
      try {
        console.log(`[RabbitMQ] Connecting to ${url}...`);
        this.connection = await amqp.connect(url, {
             timeout: 10000, 
        });
        
        this.connection.on('error', (err) => {
            console.error('[RabbitMQ] Connection error:', err);
        });

        this.connection.on('close', () => {
            console.log('[RabbitMQ] Connection closed');
        });

        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log('[RabbitMQ] Connected successfully');
        return;
      } catch (err: any) {
        console.error(`[RabbitMQ] Connection failed (retries left: ${retries}):`, err.message);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Failed to connect to RabbitMQ from Worker after multiple retries.');
  }

  async publishRenderJob(job: RenderJob): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const message = Buffer.from(JSON.stringify(job));
    this.channel!.sendToQueue(QUEUE_NAME, message, { persistent: true });
  }

  async consumeRenderJobs(handler: (job: RenderJob) => Promise<void>): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    
    const concurrency = parseInt(process.env.CONCURRENT_RENDERS || '1', 10);
    console.log(`[RabbitMQ] Setting prefetch count to ${concurrency}`);
    await this.channel!.prefetch(concurrency);
    
    await this.channel!.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;
      
      try {
        const job: RenderJob = JSON.parse(msg.content.toString());
        await handler(job);
        this.channel!.ack(msg);
      } catch (error) {
        console.error('Failed to process job:', error);
        this.channel!.nack(msg, false, false);
      }
    });
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export const rabbitmqAdapter = new RabbitMQAdapter();

