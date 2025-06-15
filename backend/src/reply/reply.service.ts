import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { GmailService } from '../email/gmail.service';

export interface CreateReplyDto {
    body: string;
    aiGenerated?: boolean;
}

export interface GenerateAiReplyDto {
    context?: string;
    tone?: 'professional' | 'casual' | 'friendly' | 'formal';
}

@Injectable()
export class ReplyService {
    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
        private gmailService: GmailService,
    ) { }

    async createReply(emailId: string, userId: string, createReplyDto: CreateReplyDto) {
        // First, verify the email exists and belongs to the user
        const email = await this.prisma.email.findFirst({
            where: { id: emailId, userId },
        });

        if (!email) {
            throw new NotFoundException('Email not found');
        }

        // Create the reply record
        const reply = await this.prisma.reply.create({
            data: {
                emailId,
                userId,
                body: createReplyDto.body,
                aiGenerated: createReplyDto.aiGenerated || false,
            },
        });

        // Send the reply via Gmail API
        try {
            await this.gmailService.sendReply(userId, emailId, createReplyDto.body);

            // Mark the original email as replied
            await this.prisma.email.update({
                where: { id: emailId },
                data: { isReplied: true },
            });

            // Log analytics
            await this.prisma.analyticsLog.create({
                data: {
                    userId,
                    action: 'EMAIL_REPLIED',
                    actionType: 'EMAIL_REPLIED',
                    data: {
                        emailId,
                        replyId: reply.id,
                        aiGenerated: createReplyDto.aiGenerated || false,
                    },
                },
            });

        } catch (error) {
            // If Gmail sending fails, we still keep the reply record but mark it as unsent
            // In a production system, you might want to implement a retry mechanism
            console.error('Failed to send reply via Gmail:', error);
            throw new Error('Failed to send reply');
        }

        return reply;
    }

    async generateAiReply(emailId: string, userId: string, generateDto: GenerateAiReplyDto) {
        // Verify the email exists and belongs to the user
        const email = await this.prisma.email.findFirst({
            where: { id: emailId, userId },
        });

        if (!email) {
            throw new NotFoundException('Email not found');
        }

        // Generate AI reply
        const aiResponse = await this.aiService.generateEmailReply({
            emailSubject: email.subject,
            emailBody: email.body,
            fromEmail: email.fromEmail,
            context: generateDto.context,
            tone: generateDto.tone || 'professional',
        });

        // Save as draft (not sent automatically)
        const draftReply = await this.prisma.reply.create({
            data: {
                emailId,
                userId,
                body: aiResponse.reply,
                aiGenerated: true,
                sentAt: null, // Not sent yet, it's a draft
            },
        });

        // Log AI usage
        await this.aiService.logAiUsage(userId, 'generate_reply');

        return {
            ...draftReply,
            confidence: aiResponse.confidence,
            reasoning: aiResponse.reasoning,
        };
    }

    async findRepliesByEmail(emailId: string, userId: string) {
        // Verify the email exists and belongs to the user
        const email = await this.prisma.email.findFirst({
            where: { id: emailId, userId },
        });

        if (!email) {
            throw new NotFoundException('Email not found');
        }

        return this.prisma.reply.findMany({
            where: { emailId },
            orderBy: { sentAt: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async updateReply(replyId: string, userId: string, updateData: Partial<CreateReplyDto>) {
        // Verify the reply exists and belongs to the user
        const reply = await this.prisma.reply.findFirst({
            where: { id: replyId, userId },
        });

        if (!reply) {
            throw new NotFoundException('Reply not found');
        }

        // Check if reply has already been sent
        if (reply.sentAt) {
            throw new ForbiddenException('Cannot edit a reply that has already been sent');
        }

        return this.prisma.reply.update({
            where: { id: replyId },
            data: updateData,
        });
    }

    async deleteReply(replyId: string, userId: string) {
        // Verify the reply exists and belongs to the user
        const reply = await this.prisma.reply.findFirst({
            where: { id: replyId, userId },
        });

        if (!reply) {
            throw new NotFoundException('Reply not found');
        }

        // Check if reply has already been sent
        if (reply.sentAt) {
            throw new ForbiddenException('Cannot delete a reply that has already been sent');
        }

        return this.prisma.reply.delete({
            where: { id: replyId },
        });
    }

    async sendDraftReply(replyId: string, userId: string) {
        // Get the draft reply
        const reply = await this.prisma.reply.findFirst({
            where: { id: replyId, userId },
            include: { email: true },
        });

        if (!reply) {
            throw new NotFoundException('Reply not found');
        }

        if (reply.sentAt) {
            throw new ForbiddenException('Reply has already been sent');
        }

        // Send via Gmail
        await this.gmailService.sendReply(userId, reply.emailId, reply.body);

        // Update reply as sent
        const sentReply = await this.prisma.reply.update({
            where: { id: replyId },
            data: { sentAt: new Date() },
        });

        // Mark original email as replied
        await this.prisma.email.update({
            where: { id: reply.emailId },
            data: { isReplied: true },
        });

        // Log analytics
        await this.prisma.analyticsLog.create({
            data: {
                userId,
                action: 'EMAIL_REPLIED',
                actionType: 'EMAIL_REPLIED',
                data: {
                    emailId: reply.emailId,
                    replyId: reply.id,
                    aiGenerated: reply.aiGenerated,
                    wasDraft: true,
                },
            },
        });

        return sentReply;
    }

    async getReplyStats(userId: string) {
        const totalReplies = await this.prisma.reply.count({
            where: { userId },
        });

        const aiGeneratedReplies = await this.prisma.reply.count({
            where: { userId, aiGenerated: true },
        });

        const draftReplies = await this.prisma.reply.count({
            where: { userId, sentAt: null },
        });

        const sentReplies = await this.prisma.reply.count({
            where: { userId, sentAt: { not: null } },
        });

        return {
            totalReplies,
            aiGeneratedReplies,
            draftReplies,
            sentReplies,
            aiUsagePercentage: totalReplies > 0 ? Math.round((aiGeneratedReplies / totalReplies) * 100) : 0,
        };
    }
} 