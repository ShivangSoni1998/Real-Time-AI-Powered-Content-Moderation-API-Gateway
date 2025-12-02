import { prisma, ContentStatus } from 'database';

export const saveResult = async (submissionId: string, result: { status: string; reason?: string; confidence: number }, originalContent: string, userId: string) => {
    try {
        // Upsert submission (since API didn't save it in this demo flow, but in real app it might exist)
        // For this demo, we assume we might need to create it if it doesn't exist, or update it.
        // However, the schema has relations. Let's assume the User exists.
        // If User doesn't exist, this will fail. In a real app, Auth service ensures User exists.
        // We'll try to find the user first or create a dummy one for the demo if needed.

        // Check if user exists, if not create a demo user (Hack for demo)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            // In production, we wouldn't do this.
            try {
                user = await prisma.user.create({
                    data: {
                        id: userId,
                        email: `demo-${userId}@example.com`,
                        name: 'Demo User'
                    }
                });
            } catch (e) {
                // Race condition or already exists
            }
        }

        const submission = await prisma.contentSubmission.create({
            data: {
                id: submissionId,
                content: originalContent,
                userId: userId,
                status: result.status as ContentStatus,
                moderationLog: {
                    create: {
                        aiResponse: result as any,
                        confidenceScore: result.confidence,
                        flaggedReason: result.reason
                    }
                }
            }
        });

        return submission;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};
