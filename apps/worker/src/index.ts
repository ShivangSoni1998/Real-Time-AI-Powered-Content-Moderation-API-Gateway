import { config } from 'dotenv';
config();

import { startConsumer } from './services/kafkaConsumer';

import { createServer } from 'http';

const start = async () => {
    console.log('Starting Worker Service...');
    try {
        await startConsumer();
        console.log('Worker Service Running');

        // Dummy HTTP server for Render health check
        const server = createServer((req, res) => {
            res.writeHead(200);
            res.end('Worker is running');
        });

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Health check server listening on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start worker:', error);
        process.exit(1);
    }
};

start();
