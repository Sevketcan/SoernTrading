import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsOverview {
    totalEmails: number;
    unreadEmails: number;
    repliedEmails: number;
    archivedEmails: number;
    pendingReplies: number;
    averageReplyTime: number; // in hours
    emailsToday: number;
    emailsThisWeek: number;
    emailsThisMonth: number;
    topSenders: Array<{
        email: string;
        name?: string;
        count: number;
    }>;
    replyStats: {
        totalReplies: number;
        aiReplies: number;
        manualReplies: number;
        aiUsagePercentage: number;
    };
    activityByDay: Array<{
        date: string;
        emailsReceived: number;
        emailsReplied: number;
    }>;
}

export interface UserAnalytics {
    userId: string;
    period: 'day' | 'week' | 'month' | 'year';
    emailVolume: {
        received: number;
        sent: number;
        archived: number;
    };
    responseMetrics: {
        averageResponseTime: number;
        responseRate: number;
        totalThreads: number;
        activeThreads: number;
    };
    aiUsage: {
        repliesGenerated: number;
        totalAiActions: number;
        usagePercentage: number;
    };
}

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getOverview(userId: string): Promise<AnalyticsOverview> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Basic email counts
        const [
            totalEmails,
            unreadEmails,
            repliedEmails,
            archivedEmails,
            emailsToday,
            emailsThisWeek,
            emailsThisMonth,
        ] = await Promise.all([
            this.prisma.email.count({ where: { userId } }),
            this.prisma.email.count({ where: { userId, isRead: false } }),
            this.prisma.email.count({ where: { userId, isReplied: true } }),
            this.prisma.email.count({ where: { userId, isArchived: true } }),
            this.prisma.email.count({ where: { userId, receivedAt: { gte: today } } }),
            this.prisma.email.count({ where: { userId, receivedAt: { gte: thisWeek } } }),
            this.prisma.email.count({ where: { userId, receivedAt: { gte: thisMonth } } }),
        ]);

        // Pending replies (emails that need response)
        const pendingReplies = await this.prisma.email.count({
            where: {
                userId,
                isArchived: false,
                isReplied: false,
                labels: { has: 'needs-reply' },
            },
        });

        // Average reply time calculation using raw SQL
        const replyTimeResult = await this.prisma.$queryRaw<[{ avg_hours: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (r.sent_at - e.received_at)) / 3600) as avg_hours
      FROM replies r
      JOIN emails e ON r.email_id = e.id
      WHERE e.user_id = ${userId} AND r.sent_at IS NOT NULL
    `;
        const averageReplyTime = replyTimeResult[0]?.avg_hours || 0;

        // Top senders
        const topSendersResult = await this.prisma.$queryRaw<Array<{
            from_email: string;
            from_name?: string;
            count: bigint;
        }>>`
      SELECT from_email, from_name, COUNT(*) as count
      FROM emails
      WHERE user_id = ${userId}
      GROUP BY from_email, from_name
      ORDER BY count DESC
      LIMIT 10
    `;

        const topSenders = topSendersResult.map(sender => ({
            email: sender.from_email,
            name: sender.from_name,
            count: Number(sender.count),
        }));

        // Reply statistics
        const [totalReplies, aiReplies] = await Promise.all([
            this.prisma.reply.count({ where: { userId } }),
            this.prisma.reply.count({ where: { userId, aiGenerated: true } }),
        ]);

        const replyStats = {
            totalReplies,
            aiReplies,
            manualReplies: totalReplies - aiReplies,
            aiUsagePercentage: totalReplies > 0 ? Math.round((aiReplies / totalReplies) * 100) : 0,
        };

        // Activity by day (last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const activityResult = await this.prisma.$queryRaw<Array<{
            date: string;
            emails_received: bigint;
            emails_replied: bigint;
        }>>`
      SELECT 
        DATE(received_at) as date,
        COUNT(*) as emails_received,
        COUNT(CASE WHEN is_replied = true THEN 1 END) as emails_replied
      FROM emails
      WHERE user_id = ${userId} AND received_at >= ${thirtyDaysAgo}
      GROUP BY DATE(received_at)
      ORDER BY date DESC
      LIMIT 30
    `;

        const activityByDay = activityResult.map(day => ({
            date: day.date,
            emailsReceived: Number(day.emails_received),
            emailsReplied: Number(day.emails_replied),
        }));

        return {
            totalEmails,
            unreadEmails,
            repliedEmails,
            archivedEmails,
            pendingReplies,
            averageReplyTime: Math.round(averageReplyTime * 10) / 10, // Round to 1 decimal
            emailsToday,
            emailsThisWeek,
            emailsThisMonth,
            topSenders,
            replyStats,
            activityByDay,
        };
    }

    async getUserAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<UserAnalytics> {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
        }

        // Email volume
        const [emailsReceived, emailsArchived] = await Promise.all([
            this.prisma.email.count({
                where: { userId, receivedAt: { gte: startDate } },
            }),
            this.prisma.email.count({
                where: { userId, isArchived: true, updatedAt: { gte: startDate } },
            }),
        ]);

        const emailsSent = await this.prisma.reply.count({
            where: { userId, sentAt: { gte: startDate, not: null } },
        });

        // Response metrics
        const totalThreadsResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT thread_id) as count
      FROM emails
      WHERE user_id = ${userId} AND thread_id IS NOT NULL AND received_at >= ${startDate}
    `;

        const activeThreadsResult = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT e.thread_id) as count
      FROM emails e
      WHERE e.user_id = ${userId} 
        AND e.thread_id IS NOT NULL 
        AND e.received_at >= ${startDate}
        AND EXISTS (
          SELECT 1 FROM replies r 
          WHERE r.email_id = e.id AND r.sent_at >= ${startDate}
        )
    `;

        const totalThreads = Number(totalThreadsResult[0]?.count || 0);
        const activeThreads = Number(activeThreadsResult[0]?.count || 0);
        const responseRate = totalThreads > 0 ? Math.round((activeThreads / totalThreads) * 100) : 0;

        // Average response time for the period
        const responseTimeResult = await this.prisma.$queryRaw<[{ avg_hours: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (r.sent_at - e.received_at)) / 3600) as avg_hours
      FROM replies r
      JOIN emails e ON r.email_id = e.id
      WHERE e.user_id = ${userId} 
        AND r.sent_at >= ${startDate} 
        AND r.sent_at IS NOT NULL
    `;
        const averageResponseTime = Math.round((responseTimeResult[0]?.avg_hours || 0) * 10) / 10;

        // AI usage
        const [totalAiActions, repliesGenerated] = await Promise.all([
            this.prisma.analyticsLog.count({
                where: {
                    userId,
                    actionType: 'AI_REPLY_GENERATED',
                    createdAt: { gte: startDate },
                },
            }),
            this.prisma.reply.count({
                where: {
                    userId,
                    aiGenerated: true,
                    createdAt: { gte: startDate },
                },
            }),
        ]);

        const totalActions = await this.prisma.analyticsLog.count({
            where: { userId, createdAt: { gte: startDate } },
        });

        const aiUsagePercentage = totalActions > 0 ? Math.round((totalAiActions / totalActions) * 100) : 0;

        return {
            userId,
            period,
            emailVolume: {
                received: emailsReceived,
                sent: emailsSent,
                archived: emailsArchived,
            },
            responseMetrics: {
                averageResponseTime,
                responseRate,
                totalThreads,
                activeThreads,
            },
            aiUsage: {
                repliesGenerated,
                totalAiActions,
                usagePercentage: aiUsagePercentage,
            },
        };
    }

    async logAction(userId: string, actionType: string, metadata?: any) {
        try {
            await this.prisma.analyticsLog.create({
                data: {
                    userId,
                    action: actionType,
                    actionType,
                    data: metadata,
                },
            });
        } catch (error) {
            console.error('Error logging action:', error);
        }
    }

    async getActionHistory(userId: string, limit: number = 100) {
        return this.prisma.analyticsLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getEmailTrends(userId: string, days: number = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const trendsResult = await this.prisma.$queryRaw<Array<{
            date: string;
            emails_received: bigint;
            emails_sent: bigint;
            emails_archived: bigint;
            ai_replies: bigint;
        }>>`
      SELECT 
        DATE(e.received_at) as date,
        COUNT(e.id) as emails_received,
        COUNT(r.id) as emails_sent,
        COUNT(CASE WHEN e.is_archived = true THEN 1 END) as emails_archived,
        COUNT(CASE WHEN r.ai_generated = true THEN 1 END) as ai_replies
      FROM emails e
      LEFT JOIN replies r ON r.email_id = e.id AND DATE(r.sent_at) = DATE(e.received_at)
      WHERE e.user_id = ${userId} AND e.received_at >= ${startDate}
      GROUP BY DATE(e.received_at)
      ORDER BY date ASC
    `;

        return trendsResult.map(trend => ({
            date: trend.date,
            emailsReceived: Number(trend.emails_received),
            emailsSent: Number(trend.emails_sent),
            emailsArchived: Number(trend.emails_archived),
            aiReplies: Number(trend.ai_replies),
        }));
    }
} 