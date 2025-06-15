import {
    Controller,
    Post,
    Get,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UnsubscribeService } from './unsubscribe.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class UnsubscribeController {
    constructor(private readonly unsubscribeService: UnsubscribeService) { }

    // POST /emails/:id/unsubscribe
    @Post('emails/:id/unsubscribe')
    @HttpCode(HttpStatus.ACCEPTED)
    async requestUnsubscribe(
        @Param('id') emailId: string,
        @Request() req: any,
    ) {
        return this.unsubscribeService.requestUnsubscribe(emailId, req.user.id);
    }

    // GET /unsubscribe/requests
    @Get('unsubscribe/requests')
    async getUnsubscribeRequests(@Request() req: any) {
        return this.unsubscribeService.getUnsubscribeRequests(req.user.id);
    }

    // GET /unsubscribe/stats
    @Get('unsubscribe/stats')
    async getUnsubscribeStats(@Request() req: any) {
        return this.unsubscribeService.getUnsubscribeStats(req.user.id);
    }

    // POST /unsubscribe/:id/retry
    @Post('unsubscribe/:id/retry')
    async retryUnsubscribe(
        @Param('id') unsubscribeRequestId: string,
        @Request() req: any,
    ) {
        return this.unsubscribeService.retryFailedUnsubscribe(
            unsubscribeRequestId,
            req.user.id,
        );
    }
} 