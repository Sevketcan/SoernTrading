import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { GmailService } from '../email/gmail.service';

export interface UnsubscribeJobData {
    emailId: string;
    userId: string;
    senderEmail: string;
    unsubscribeRequestId: string;
}

@Injectable()
export class UnsubscribeService {
    constructor(
        private prisma: PrismaService,
        private gmailService: GmailService,
        @InjectQueue('unsubscribe') private unsubscribeQueue: Queue,
    ) { }

    async requestUnsubscribe(emailId: string, userId: string) {
        // First, verify the email exists and belongs to the user
        const email = await this.prisma.email.findFirst({
            where: { id: emailId, userId },
        });

        if (!email) {
            throw new NotFoundException('Email not found');
        }

        // Check if there's already a pending unsubscribe request for this sender
        const existingRequest = await this.prisma.unsubscribeRequest.findFirst({
            where: {
                userId,
                email: {
                    fromEmail: email.fromEmail,
                },
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            return existingRequest;
        }

        // Create unsubscribe request
        const unsubscribeRequest = await this.prisma.unsubscribeRequest.create({
            data: {
                emailId,
                userId,
                status: 'PENDING',
            },
        });

        // Add job to queue for background processing
        await this.unsubscribeQueue.add('process-unsubscribe', {
            emailId,
            userId,
            senderEmail: email.fromEmail,
            unsubscribeRequestId: unsubscribeRequest.id,
        } as UnsubscribeJobData, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });

        // Log analytics
        await this.prisma.analyticsLog.create({
            data: {
                userId,
                action: 'UNSUBSCRIBE_REQUESTED',
                actionType: 'UNSUBSCRIBE_REQUESTED',
                data: {
                    emailId,
                    senderEmail: email.fromEmail,
                    unsubscribeRequestId: unsubscribeRequest.id,
                },
            },
        });

        return unsubscribeRequest;
    }

    async processUnsubscribe(jobData: UnsubscribeJobData) {
        const { emailId, userId, senderEmail, unsubscribeRequestId } = jobData;

        try {
            // Update status to processing
            await this.prisma.unsubscribeRequest.update({
                where: { id: unsubscribeRequestId },
                data: { status: 'PROCESSING' },
            });

            // Step 1: Create Gmail filter to automatically archive emails from this sender
            await this.createGmailFilter(userId, senderEmail);

            // Step 2: Archive all existing emails from this sender
            await this.archiveExistingEmails(userId, senderEmail);

            // Step 3: Add unsubscribe label to emails from this sender
            await this.addUnsubscribeLabel(userId, senderEmail);

            // Mark as successful
            await this.prisma.unsubscribeRequest.update({
                where: { id: unsubscribeRequestId },
                data: {
                    status: 'SUCCESS',
                    processedAt: new Date(),
                },
            });

            return { success: true };

        } catch (error) {
            // Mark as failed and log error
            await this.prisma.unsubscribeRequest.update({
                where: { id: unsubscribeRequestId },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                    processedAt: new Date(),
                },
            });

            throw error;
        }
    }

    private async createGmailFilter(userId: string, senderEmail: string) {
        // This would create a Gmail filter that automatically archives emails from the sender
        // Implementation depends on Gmail API filter creation
        try {
            await this.gmailService.addLabel('auto-unsubscribed', userId, senderEmail);
            console.log(`Created Gmail filter for ${senderEmail}`);
        } catch (error) {
            console.error(`Failed to create Gmail filter for ${senderEmail}:`, error);
            // Don't throw error for filter creation failure as it's not critical
        }
    }

    private async archiveExistingEmails(userId: string, senderEmail: string) {
        // Get all emails from this sender
        const emails = await this.prisma.email.findMany({
            where: {
                userId,
                fromEmail: senderEmail,
                isArchived: false,
            },
        });

        // Archive each email in our database and Gmail
        for (const email of emails) {
            try {
                await this.gmailService.archiveEmail(email.messageId, userId);
                await this.prisma.email.update({
                    where: { id: email.id },
                    data: { isArchived: true },
                });
            } catch (error) {
                console.error(`Failed to archive email ${email.id}:`, error);
                // Continue with other emails even if one fails
            }
        }
    }

    private async addUnsubscribeLabel(userId: string, senderEmail: string) {
        // Add 'unsubscribed' label to all emails from this sender
        const emails = await this.prisma.email.findMany({
            where: {
                userId,
                fromEmail: senderEmail,
            },
        });

        for (const email of emails) {
            try {
                // Add label in our database
                const currentLabels = email.labels || [];
                if (!currentLabels.includes('unsubscribed')) {
                    await this.prisma.email.update({
                        where: { id: email.id },
                        data: {
                            labels: [...currentLabels, 'unsubscribed'],
                        },
                    });
                }

                // Add label in Gmail
                await this.gmailService.addLabel(email.messageId, userId, 'unsubscribed');
            } catch (error) {
                console.error(`Failed to add unsubscribe label to email ${email.id}:`, error);
            }
        }
    }

    async getUnsubscribeRequests(userId: string) {
        return this.prisma.unsubscribeRequest.findMany({
            where: { userId },
            include: {
                email: {
                    select: {
                        id: true,
                        subject: true,
                        fromEmail: true,
                        fromName: true,
                        receivedAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getUnsubscribeStats(userId: string) {
        const [total, pending, processing, success, failed] = await Promise.all([
            this.prisma.unsubscribeRequest.count({ where: { userId } }),
            this.prisma.unsubscribeRequest.count({ where: { userId, status: 'PENDING' } }),
            this.prisma.unsubscribeRequest.count({ where: { userId, status: 'PROCESSING' } }),
            this.prisma.unsubscribeRequest.count({ where: { userId, status: 'SUCCESS' } }),
            this.prisma.unsubscribeRequest.count({ where: { userId, status: 'FAILED' } }),
        ]);

        return {
            total,
            pending,
            processing,
            success,
            failed,
            successRate: total > 0 ? Math.round((success / total) * 100) : 0,
        };
    }

    async retryFailedUnsubscribe(unsubscribeRequestId: string, userId: string) {
        const request = await this.prisma.unsubscribeRequest.findFirst({
            where: { id: unsubscribeRequestId, userId },
            include: { email: true },
        });

        if (!request) {
            throw new NotFoundException('Unsubscribe request not found');
        }

        if (request.status !== 'FAILED') {
            throw new Error('Can only retry failed unsubscribe requests');
        }

        // Reset status to pending
        await this.prisma.unsubscribeRequest.update({
            where: { id: unsubscribeRequestId },
            data: {
                status: 'PENDING',
                errorMessage: null,
            },
        });

        // Add back to queue
        await this.unsubscribeQueue.add('process-unsubscribe', {
            emailId: request.emailId,
            userId,
            senderEmail: request.email.fromEmail,
            unsubscribeRequestId: request.id,
        } as UnsubscribeJobData);

        return request;
    }
} 