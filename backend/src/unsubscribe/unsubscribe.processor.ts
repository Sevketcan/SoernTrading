import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { UnsubscribeService, UnsubscribeJobData } from './unsubscribe.service';

@Processor('unsubscribe')
export class UnsubscribeProcessor {
    private readonly logger = new Logger(UnsubscribeProcessor.name);

    constructor(private unsubscribeService: UnsubscribeService) { }

    @Process('process-unsubscribe')
    async handleUnsubscribe(job: Job<UnsubscribeJobData>) {
        const { emailId, userId, senderEmail, unsubscribeRequestId } = job.data;

        this.logger.log(`Processing unsubscribe request ${unsubscribeRequestId} for ${senderEmail}`);

        try {
            await this.unsubscribeService.processUnsubscribe(job.data);
            this.logger.log(`Successfully processed unsubscribe request ${unsubscribeRequestId}`);
        } catch (error) {
            this.logger.error(`Failed to process unsubscribe request ${unsubscribeRequestId}:`, error);
            throw error; // This will mark the job as failed
        }
    }

    @Process('cleanup-old-requests')
    async handleCleanup(job: Job) {
        this.logger.log('Starting cleanup of old unsubscribe requests');

        // This could clean up old completed requests, etc.
        // Implementation depends on your retention policy

        this.logger.log('Completed cleanup of old unsubscribe requests');
    }
} 