import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { rateLimiter } from './middleware/rateLimiter';
import { submissionRouter } from './routes/submission';

config();

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
