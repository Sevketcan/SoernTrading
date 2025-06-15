import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmailService, EmailFilters } from './email.service';

export interface AddLabelDto {
    label: string;
}

export interface RemoveLabelDto {
    label: string;
}

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Get()
    async findAll(
        @Request() req: any,
        @Query('labels') labels?: string,
        @Query('isArchived') isArchived?: string,
        @Query('isReplied') isReplied?: string,
        @Query('isRead') isRead?: string,
        @Query('search') search?: string,
    ) {
        const filters: EmailFilters = {
            ...(labels && { labels: labels.split(',') }),
            ...(isArchived !== undefined && { isArchived: isArchived === 'true' }),
            ...(isReplied !== undefined && { isReplied: isReplied === 'true' }),
            ...(isRead !== undefined && { isRead: isRead === 'true' }),
            ...(search && { search }),
        };

        return this.emailService.findAll(req.user.id, filters);
    }

    @Get('stats')
    async getStats(@Request() req: any) {
        return this.emailService.getEmailStats(req.user.id);
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return this.emailService.findOne(id, req.user.id);
    }

    @Put(':id/archive')
    @HttpCode(HttpStatus.OK)
    async archive(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return this.emailService.archive(id, req.user.id);
    }

    @Put(':id/read')
    @HttpCode(HttpStatus.OK)
    async markAsRead(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return this.emailService.markAsRead(id, req.user.id);
    }

    @Put(':id/replied')
    @HttpCode(HttpStatus.OK)
    async markAsReplied(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return this.emailService.markAsReplied(id, req.user.id);
    }

    @Post(':id/labels')
    async addLabel(
        @Param('id') id: string,
        @Body() addLabelDto: AddLabelDto,
        @Request() req: any,
    ) {
        return this.emailService.addLabel(id, req.user.id, addLabelDto.label);
    }

    @Delete(':id/labels')
    async removeLabel(
        @Param('id') id: string,
        @Body() removeLabelDto: RemoveLabelDto,
        @Request() req: any,
    ) {
        return this.emailService.removeLabel(id, req.user.id, removeLabelDto.label);
    }

    @Post('sync')
    @HttpCode(HttpStatus.OK)
    async syncEmails(@Request() req: any) {
        return this.emailService.syncGmailEmails(req.user.id);
    }
} 