import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

export interface GenerateReplyRequest {
    emailSubject: string;
    emailBody: string;
    fromEmail: string;
    context?: string;
    tone?: 'professional' | 'casual' | 'friendly' | 'formal';
}

export interface GenerateReplyResponse {
    reply: string;
    confidence: number;
    reasoning?: string;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            this.logger.warn('OpenAI API key not found. AI features will be disabled.');
            return;
        }

        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async generateEmailReply(request: GenerateReplyRequest): Promise<GenerateReplyResponse> {
        if (!this.openai) {
            throw new Error('OpenAI not configured');
        }

        try {
            const prompt = this.buildReplyPrompt(request);

            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that helps write professional email replies. You should write concise, appropriate responses that match the tone and context of the original email.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            const reply = completion.choices[0]?.message?.content?.trim();

            if (!reply) {
                throw new Error('No reply generated');
            }

            // Simple confidence scoring based on response length and quality
            const confidence = this.calculateConfidence(reply, request);

            return {
                reply,
                confidence,
                reasoning: 'Generated using GPT-4 based on email context and tone requirements',
            };

        } catch (error) {
            this.logger.error('Failed to generate email reply:', error);
            throw new Error('Failed to generate AI reply');
        }
    }

    private buildReplyPrompt(request: GenerateReplyRequest): string {
        const { emailSubject, emailBody, fromEmail, context, tone = 'professional' } = request;

        return `
Please generate a ${tone} email reply to the following email:

**From:** ${fromEmail}
**Subject:** ${emailSubject}
**Email Body:**
${emailBody}

${context ? `**Additional Context:** ${context}` : ''}

**Instructions:**
- Write a ${tone} reply
- Keep it concise and relevant
- Don't include salutation or signature (just the body)
- Match the communication style of the original email
- Be helpful and appropriate

**Reply:**
    `.trim();
    }

    private calculateConfidence(reply: string, request: GenerateReplyRequest): number {
        let confidence = 80; // Base confidence

        // Adjust based on reply length (too short or too long reduces confidence)
        const wordCount = reply.split(' ').length;
        if (wordCount < 10) confidence -= 20;
        if (wordCount > 200) confidence -= 10;

        // Adjust based on original email complexity
        const originalWordCount = request.emailBody.split(' ').length;
        if (originalWordCount > 500) confidence -= 10; // Complex emails are harder

        // Ensure confidence is between 0 and 100
        return Math.max(0, Math.min(100, confidence));
    }

    async generateEmailSummary(emailBody: string): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI not configured');
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that creates concise summaries of emails. Summarize the key points in 1-2 sentences.',
                    },
                    {
                        role: 'user',
                        content: `Please summarize this email:\n\n${emailBody}`,
                    },
                ],
                max_tokens: 150,
                temperature: 0.3,
            });

            return completion.choices[0]?.message?.content?.trim() || 'Unable to generate summary';
        } catch (error) {
            this.logger.error('Failed to generate email summary:', error);
            return 'Summary generation failed';
        }
    }

    async categorizeEmail(emailSubject: string, emailBody: string, fromEmail: string): Promise<string[]> {
        if (!this.openai) {
            return ['uncategorized'];
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI that categorizes emails. Return up to 3 relevant categories from this list:
- newsletter
- marketing
- work
- personal
- financial
- support
- notification
- social
- travel
- shopping
- important
- spam
- meeting
- urgent

Return only the category names, separated by commas.`,
                    },
                    {
                        role: 'user',
                        content: `Subject: ${emailSubject}\nFrom: ${fromEmail}\nBody: ${emailBody.substring(0, 500)}...`,
                    },
                ],
                max_tokens: 50,
                temperature: 0.2,
            });

            const categoriesText = completion.choices[0]?.message?.content?.trim();
            if (!categoriesText) return ['uncategorized'];

            return categoriesText
                .split(',')
                .map(cat => cat.trim().toLowerCase())
                .filter(cat => cat.length > 0)
                .slice(0, 3); // Max 3 categories

        } catch (error) {
            this.logger.error('Failed to categorize email:', error);
            return ['uncategorized'];
        }
    }

    async analyzeEmailSentiment(emailBody: string): Promise<'positive' | 'negative' | 'neutral'> {
        if (!this.openai) {
            return 'neutral';
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Analyze the sentiment of the following email. Respond with only: positive, negative, or neutral',
                    },
                    {
                        role: 'user',
                        content: emailBody.substring(0, 1000), // Limit for cost efficiency
                    },
                ],
                max_tokens: 10,
                temperature: 0.1,
            });

            const sentiment = completion.choices[0]?.message?.content?.trim().toLowerCase();

            if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
                return sentiment;
            }

            return 'neutral';
        } catch (error) {
            this.logger.error('Failed to analyze sentiment:', error);
            return 'neutral';
        }
    }

    async logAiUsage(userId: string, operation: string, tokensUsed?: number) {
        try {
            await this.prisma.analyticsLog.create({
                data: {
                    userId,
                    action: operation,
                    actionType: 'AI_REPLY_GENERATED',
                    data: {
                        operation,
                        tokensUsed: tokensUsed || 0,
                        timestamp: new Date().toISOString(),
                    },
                },
            });
        } catch (error) {
            this.logger.error('Failed to log AI usage:', error);
        }
    }
} 