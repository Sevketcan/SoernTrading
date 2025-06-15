import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';

interface GmailMessage {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    payload: {
        headers: Array<{ name: string; value: string }>;
        body?: { data?: string };
        parts?: Array<{
            mimeType: string;
            body?: { data?: string };
            parts?: any[];
        }>;
    };
    internalDate: string;
}

@Injectable()
export class GmailService {
    private readonly logger = new Logger(GmailService.name);
    private oauth2Client: OAuth2Client;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            this.configService.get('GOOGLE_CLIENT_ID'),
            this.configService.get('GOOGLE_CLIENT_SECRET'),
            this.configService.get('GOOGLE_REDIRECT_URI'),
        );
    }

    private async getGmailClient(userId: string) {
        // Get user's OAuth tokens from database
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.googleId) {
            throw new Error('User not authenticated with Google');
        }

        // In a real implementation, you'd store and retrieve OAuth tokens
        // For now, we'll assume tokens are managed elsewhere
        const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        return gmail;
    }

    async syncEmails(userId: string, maxResults: number = 50) {
        const syncedEmails: any[] = [];

        try {
            const gmail = await this.getGmailClient(userId);

            // Get list of messages
            const response = await gmail.users.messages.list({
                userId: 'me',
                maxResults,
                q: 'in:inbox', // Only inbox emails
            });

            const messages = response.data.messages || [];

            for (const message of messages) {
                try {
                    const emailDetails = await this.getEmailDetails(userId, message.id!);
                    if (emailDetails) {
                        syncedEmails.push(emailDetails);
                    }
                } catch (error) {
                    this.logger.error(`Failed to sync email ${message.id}:`, error);
                }
            }

            return syncedEmails;
        } catch (error) {
            this.logger.error('Failed to sync emails:', error);
            throw error;
        }
    }

    async getEmailDetails(userId: string, messageId: string) {
        try {
            const gmail = await this.getGmailClient(userId);

            const response = await gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            const message: GmailMessage = response.data as GmailMessage;

            // Extract email details
            const headers = message.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const fromHeader = headers.find(h => h.name === 'From')?.value || '';
            const toHeader = headers.find(h => h.name === 'To')?.value || '';
            const dateHeader = headers.find(h => h.name === 'Date')?.value;

            // Parse from email and name
            const fromMatch = fromHeader.match(/^(.+?)\s*<(.+?)>$/) || [null, fromHeader, fromHeader];
            const fromName = fromMatch[1]?.trim() || null;
            const fromEmail = fromMatch[2]?.trim() || fromHeader;

            // Extract body
            const body = this.extractEmailBody(message.payload);

            // Check if email already exists
            const existingEmail = await this.prisma.email.findUnique({
                where: { messageId },
            });

            if (existingEmail) {
                return existingEmail;
            }

            // Create email record
            const emailData = {
                subject,
                body,
                fromEmail,
                fromName,
                toEmail: toHeader,
                messageId,
                threadId: message.threadId,
                receivedAt: new Date(parseInt(message.internalDate)),
                userId,
            };

            return await this.prisma.email.create({
                data: emailData,
            });

        } catch (error) {
            this.logger.error(`Failed to get email details for ${messageId}:`, error);
            return null;
        }
    }

    private extractEmailBody(payload: any): string {
        if (payload.body?.data) {
            return Buffer.from(payload.body.data, 'base64').toString();
        }

        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' && part.body?.data) {
                    return Buffer.from(part.body.data, 'base64').toString();
                }
                if (part.mimeType === 'text/html' && part.body?.data) {
                    return Buffer.from(part.body.data, 'base64').toString();
                }
                // Recursively check nested parts
                if (part.parts) {
                    const nestedBody = this.extractEmailBody(part);
                    if (nestedBody) return nestedBody;
                }
            }
        }

        return '';
    }

    async sendReply(userId: string, emailId: string, replyText: string) {
        try {
            const gmail = await this.getGmailClient(userId);

            // Get original email details
            const email = await this.prisma.email.findUnique({
                where: { id: emailId },
            });

            if (!email) {
                throw new Error('Email not found');
            }

            // Create reply message
            const replyMessage = [
                `To: ${email.fromEmail}`,
                `Subject: Re: ${email.subject}`,
                `In-Reply-To: ${email.messageId}`,
                `References: ${email.messageId}`,
                '',
                replyText,
            ].join('\n');

            const encodedMessage = Buffer.from(replyMessage).toString('base64url');

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                    threadId: email.threadId,
                },
            });

            // Mark email as replied
            await this.prisma.email.update({
                where: { id: emailId },
                data: { isReplied: true },
            });

            return true;
        } catch (error) {
            this.logger.error('Failed to send reply:', error);
            throw error;
        }
    }

    async archiveEmail(messageId: string, userId: string) {
        try {
            const gmail = await this.getGmailClient(userId);

            await gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: ['INBOX'],
                },
            });

            return true;
        } catch (error) {
            this.logger.error('Failed to archive email:', error);
            throw error;
        }
    }

    async addLabel(messageId: string, userId: string, labelName: string) {
        try {
            const gmail = await this.getGmailClient(userId);

            // First, get or create the label
            const labels = await gmail.users.labels.list({ userId: 'me' });
            let labelId = labels.data.labels?.find(l => l.name === labelName)?.id;

            if (!labelId) {
                // Create label if it doesn't exist
                const newLabel = await gmail.users.labels.create({
                    userId: 'me',
                    requestBody: {
                        name: labelName,
                        messageListVisibility: 'show',
                        labelListVisibility: 'labelShow',
                    },
                });
                labelId = newLabel.data.id;
            }

            if (labelId) {
                await gmail.users.messages.modify({
                    userId: 'me',
                    id: messageId,
                    requestBody: {
                        addLabelIds: [labelId],
                    },
                });
            }

            return true;
        } catch (error) {
            this.logger.error('Failed to add label:', error);
            throw error;
        }
    }
} 