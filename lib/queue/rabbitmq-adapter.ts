import amqp from 'amqplib';
import { QueueAdapter, RenderJob } from './types';

const QUEUE_NAME = 'video-render';

class RabbitMQAdapter implements QueueAdapter {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL || 'amqp://user:password@127.0.0.1:5672';
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(QUEUE_NAME, { durable: true });
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
    
    await this.channel!.prefetch(1);
    
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

