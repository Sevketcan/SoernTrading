import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // GET /analytics/overview
    @Get('overview')
    async getOverview(@Request() req: any) {
        return this.analyticsService.getOverview(req.user.id);
    }

    // GET /analytics/user/:id (admin only or self)
    @Get('user/:id')
    async getUserAnalytics(
        @Param('id') userId: string,
        @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'month',
        @Request() req: any,
    ) {
        // For now, only allow users to view their own analytics
        // In production, you might want to add admin role checking
        if (req.user.id !== userId) {
            throw new Error('Unauthorized: Can only view your own analytics');
        }

        return this.analyticsService.getUserAnalytics(userId, period);
    }

    // GET /analytics/trends
    @Get('trends')
    async getEmailTrends(
        @Query('days') days: string = '30',
        @Request() req: any,
    ) {
        const numberOfDays = parseInt(days, 10) || 30;
        return this.analyticsService.getEmailTrends(req.user.id, numberOfDays);
    }

    // GET /analytics/history
    @Get('history')
    async getActionHistory(
        @Query('limit') limit: string = '100',
        @Request() req: any,
    ) {
        const limitNumber = parseInt(limit, 10) || 100;
        return this.analyticsService.getActionHistory(req.user.id, limitNumber);
    }
} 