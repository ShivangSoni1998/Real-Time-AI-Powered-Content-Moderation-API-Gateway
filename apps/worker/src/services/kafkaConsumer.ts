import { Kafka } from 'kafkajs';
import { classifyContent } from './aiService';
import { saveResult } from './dbService';

const kafka = new Kafka({
    clientId: 'worker-service',
    brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')]
});

const consumer = kafka.consumer({ groupId: 'moderation-group' });

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
                await saveResult(submissionId, classification, content, userId);
                console.log(`Saved result for ${submissionId}`);

                // 3. TODO: Notify Frontend (Phase 4)

            } catch (error) {
                console.error('Error processing message:', error);
                // In production: Send to Dead Letter Queue (DLQ)
            }
        },
    });
};
