import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { kafkaProducer } from '../services/kafkaProducer';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const router = Router();

const submissionSchema = z.object({
    userId: z.string().uuid(),
    content: z.string().min(1).max(1000)
});

router.post('/', async (req, res) => {
    try {
        const validatedData = submissionSchema.parse(req.body);

        // In a real app, we would save to DB first with PENDING status
        // For this demo, we'll send directly to Kafka

        const payload = {
            ...validatedData,
            timestamp: new Date().toISOString(),
            submissionId: randomUUID() // Mock ID since we aren't saving to DB in API yet
        };

        await kafkaProducer.sendSubmission(payload);

        res.status(StatusCodes.ACCEPTED).json({
            message: 'Content submitted for moderation',
            submissionId: payload.submissionId
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.issues });
            return;
        }
        console.error('Submission error:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
});

export const submissionRouter = router;
