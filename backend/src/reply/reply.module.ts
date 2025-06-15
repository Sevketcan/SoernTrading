import { Module } from '@nestjs/common';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, AiModule, EmailModule],
    controllers: [ReplyController],
    providers: [ReplyService],
    exports: [ReplyService],
})
export class ReplyModule { } 