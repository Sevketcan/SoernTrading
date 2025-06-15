import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplyService, CreateReplyDto, GenerateAiReplyDto } from './reply.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReplyController {
    constructor(private readonly replyService: ReplyService) { }

    // POST /emails/:id/reply
    @Post('emails/:id/reply')
    async createReply(
        @Param('id') emailId: string,
        @Body() createReplyDto: CreateReplyDto,
        @Request() req: any,
    ) {
        return this.replyService.createReply(emailId, req.user.id, createReplyDto);
    }

    // GET /emails/:id/replies
    @Get('emails/:id/replies')
    async getReplies(
        @Param('id') emailId: string,
        @Request() req: any,
    ) {
        return this.replyService.findRepliesByEmail(emailId, req.user.id);
    }

    // POST /emails/:id/reply/generate-ai
    @Post('emails/:id/reply/generate-ai')
    async generateAiReply(
        @Param('id') emailId: string,
        @Body() generateDto: GenerateAiReplyDto,
        @Request() req: any,
    ) {
        return this.replyService.generateAiReply(emailId, req.user.id, generateDto);
    }

    // PUT /replies/:id
    @Put('replies/:id')
    async updateReply(
        @Param('id') replyId: string,
        @Body() updateData: Partial<CreateReplyDto>,
        @Request() req: any,
    ) {
        return this.replyService.updateReply(replyId, req.user.id, updateData);
    }

    // DELETE /replies/:id
    @Delete('replies/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteReply(
        @Param('id') replyId: string,
        @Request() req: any,
    ) {
        await this.replyService.deleteReply(replyId, req.user.id);
    }

    // POST /replies/:id/send
    @Post('replies/:id/send')
    async sendDraftReply(
        @Param('id') replyId: string,
        @Request() req: any,
    ) {
        return this.replyService.sendDraftReply(replyId, req.user.id);
    }

    // GET /replies/stats
    @Get('replies/stats')
    async getReplyStats(@Request() req: any) {
        return this.replyService.getReplyStats(req.user.id);
    }
} 