import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Email, Prisma } from '@prisma/client';
import { GmailService } from './gmail.service';

export interface EmailFilters {
    labels?: string[];
    isArchived?: boolean;
    isReplied?: boolean;
    isRead?: boolean;
    search?: string;
}

export interface EmailCreateDto {
    subject: string;
    body: string;
    fromEmail: string;
    fromName?: string;
    toEmail: string;
    messageId: string;
    threadId?: string;
    receivedAt: Date;
}

@Injectable()
export class EmailService {
    constructor(
        private prisma: PrismaService,
        private gmailService: GmailService,
    ) { }

    async findAll(userId: string, filters: EmailFilters = {}) {
        const where: Prisma.EmailWhereInput = {
            userId,
            ...(filters.isArchived !== undefined && { isArchived: filters.isArchived }),
            ...(filters.isReplied !== undefined && { isReplied: filters.isReplied }),
            ...(filters.isRead !== undefined && { isRead: filters.isRead }),
            ...(filters.labels?.length && {
                labels: {
                    hasSome: filters.labels,
                },
            }),
            ...(filters.search && {
                OR: [
                    { subject: { contains: filters.search, mode: 'insensitive' } },
                    { body: { contains: filters.search, mode: 'insensitive' } },
                    { fromEmail: { contains: filters.search, mode: 'insensitive' } },
                    { fromName: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
        };

        return this.prisma.email.findMany({
            where,
            orderBy: { receivedAt: 'desc' },
            include: {
                replies: true,
                unsubscribeRequests: true,
            },
        });
    }

    async findOne(id: string, userId: string) {
        const email = await this.prisma.email.findFirst({
            where: { id, userId },
            include: {
                replies: {
                    orderBy: { sentAt: 'asc' },
                },
                unsubscribeRequests: true,
            },
        });

        if (!email) {
            throw new NotFoundException('Email not found');
        }

        // Mark as read when viewing
        if (!email.isRead) {
            await this.markAsRead(id, userId);
        }

        return email;
    }

    async create(emailData: EmailCreateDto, userId: string) {
        return this.prisma.email.create({
            data: {
                ...emailData,
                userId,
            },
        });
    }

    async archive(id: string, userId: string) {
        const email = await this.findOne(id, userId);

        // Archive in Gmail as well
        await this.gmailService.archiveEmail(email.messageId, userId);

        return this.prisma.email.update({
            where: { id },
            data: { isArchived: true },
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.email.update({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    async markAsReplied(id: string, userId: string) {
        return this.prisma.email.update({
            where: { id, userId },
            data: { isReplied: true },
        });
    }

    async addLabel(id: string, userId: string, label: string) {
        const email = await this.findOne(id, userId);

        if (email.labels.includes(label)) {
            return email;
        }

        return this.prisma.email.update({
            where: { id },
            data: {
                labels: {
                    push: label,
                },
            },
        });
    }

    async removeLabel(id: string, userId: string, label: string) {
        const email = await this.findOne(id, userId);

        return this.prisma.email.update({
            where: { id },
            data: {
                labels: email.labels.filter(l => l !== label),
            },
        });
    }

    async getEmailStats(userId: string) {
        const totalEmails = await this.prisma.email.count({
            where: { userId },
        });

        const archivedEmails = await this.prisma.email.count({
            where: { userId, isArchived: true },
        });

        const repliedEmails = await this.prisma.email.count({
            where: { userId, isReplied: true },
        });

        const unreadEmails = await this.prisma.email.count({
            where: { userId, isRead: false },
        });

        const pendingReplies = await this.prisma.email.count({
            where: {
                userId,
                isArchived: false,
                isReplied: false,
                labels: {
                    has: 'needs-reply'
                }
            },
        });

        return {
            totalEmails,
            archivedEmails,
            repliedEmails,
            unreadEmails,
            pendingReplies,
        };
    }

    async syncGmailEmails(userId: string) {
        // This will fetch emails from Gmail and sync them to our database
        return this.gmailService.syncEmails(userId);
    }
} 