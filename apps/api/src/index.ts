import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { rateLimiter } from './middleware/rateLimiter';
import { submissionRouter } from './routes/submission';

config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // In production, set this to your frontend URL
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis Subscriber for Real-time updates
const redisSubscriber = new Redis(REDIS_URL, {
    family: 0,
    tls: REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redisSubscriber.subscribe('moderation-updates', (err, count) => {
    if (err) {
        console.error('Failed to subscribe: %s', err.message);
    } else {
        console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    }
});

redisSubscriber.on('message', (channel, message) => {
    console.log(`Received ${message} from ${channel}`);
    if (channel === 'moderation-updates') {
        const update = JSON.parse(message);
        io.emit('moderation-update', update);
    }
});

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/submissions', rateLimiter, submissionRouter);

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
