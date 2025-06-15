import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-reply')
    async generateReply(
        @Body() body: {
            emailSubject: string;
            emailBody: string;
            fromEmail: string;
            context?: string;
            tone?: 'professional' | 'casual' | 'friendly' | 'formal'
        }
    ) {
        return this.aiService.generateEmailReply(body);
    }

    @Post('categorize-email')
    async categorizeEmail(@Body() body: { emailSubject: string; emailBody: string; fromEmail: string }) {
        return this.aiService.categorizeEmail(body.emailSubject, body.emailBody, body.fromEmail);
    }

    @Post('analyze-sentiment')
    async analyzeSentiment(@Body() body: { emailContent: string }) {
        return this.aiService.analyzeEmailSentiment(body.emailContent);
    }
} 