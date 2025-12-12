import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import { classifyContent } from './aiService';
import { saveResult } from './dbService';

const kafka = new Kafka({
    clientId: 'worker-service',
    brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')],
    ssl: !!process.env.KAFKA_USERNAME,
    sasl: process.env.KAFKA_USERNAME ? {
        mechanism: (process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512') || 'scram-sha-256',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD || '',
    } as any : undefined,
});

const consumer = kafka.consumer({ groupId: 'moderation-group' });

// Initialize Redis Publisher
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPublisher = new Redis(REDIS_URL, {
    family: 0,
    tls: REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

export const startConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'content-submission', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const prefix = `${topic}[${partition}|${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);

            if (!message.value) return;

            try {
                const payload = JSON.parse(message.value.toString());
                const { submissionId, content, userId } = payload;

                console.log(`Processing submission: ${submissionId}`);

                // 1. Call AI
                const classification = await classifyContent(content);
                console.log(`AI Result for ${submissionId}:`, classification);

                // 2. Save to DB
                const savedSubmission = await saveResult(submissionId, classification, content, userId);
                console.log(`Saved result for ${submissionId}`);

                // 3. Notify Frontend via Redis Pub/Sub
                const updatePayload = {
                    submissionId,
                    status: classification.status,
                    reason: classification.reason,
                    confidence: classification.confidence,
                    originalContent: content,
                    timestamp: new Date().toISOString()
                };

                await redisPublisher.publish('moderation-updates', JSON.stringify(updatePayload));
                console.log(`Published update for ${submissionId} to Redis`);

            } catch (error) {
                console.error('Error processing message:', error);
                // In production: Send to Dead Letter Queue (DLQ)
            }
        },
    });
};
