import { Kafka, Producer } from 'kafkajs';

class KafkaProducerService {
    private producer: Producer;
    private isConnected: boolean = false;

    constructor() {
        const kafka = new Kafka({
            clientId: 'api-gateway',
            brokers: [(process.env.KAFKA_BROKER || 'localhost:9092')]
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
