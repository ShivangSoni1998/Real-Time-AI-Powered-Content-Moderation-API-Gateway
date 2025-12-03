import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const submissionId = 'e015542c-2502-4c0e-9200-2e5cad9fe9b4';
    const submission = await prisma.contentSubmission.findUnique({
        where: { id: submissionId },
        include: { moderationLog: true }
    });

    console.log('Submission:', JSON.stringify(submission, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
