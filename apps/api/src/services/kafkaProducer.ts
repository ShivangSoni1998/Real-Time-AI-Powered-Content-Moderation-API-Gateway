import { Kafka, Producer } from 'kafkajs';

class KafkaProducerService {
    private producer: Producer;
    private isConnected: boolean = false;

    constructor() {
        const kafka = new Kafka({
            clientId: 'api-gateway',
            brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')],
            ssl: !!process.env.KAFKA_USERNAME,
            sasl: process.env.KAFKA_USERNAME ? {
                mechanism: (process.env.KAFKA_SASL_MECHANISM as 'plain' | 'scram-sha-256' | 'scram-sha-512') || 'scram-sha-256',
                username: process.env.KAFKA_USERNAME,
                password: process.env.KAFKA_PASSWORD || '',
            } as any : undefined,
        });

        this.producer = kafka.producer();
    }

    async connect() {
        if (!this.isConnected) {
            await this.producer.connect();
            this.isConnected = true;
            console.log('Kafka Producer connected');
        }
    }

    async sendSubmission(submission: any) {
        await this.connect();

        await this.producer.send({
            topic: 'content-submission',
            messages: [
                {
                    value: JSON.stringify(submission)
                }
            ]
        });
    }

    async disconnect() {
        if (this.isConnected) {
            await this.producer.disconnect();
            this.isConnected = false;
        }
    }
}

export const kafkaProducer = new KafkaProducerService();
