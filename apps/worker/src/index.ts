import { config } from 'dotenv';
config();

import { startConsumer } from './services/kafkaConsumer';

const start = async () => {
    console.log('Starting Worker Service...');
    try {
        await startConsumer();
        console.log('Worker Service Running');
    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
};

start();
