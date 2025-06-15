import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GmailService } from './gmail.service';

@Module({
    imports: [PrismaModule],
    controllers: [EmailController],
    providers: [EmailService, GmailService],
    exports: [EmailService, GmailService],
})
export class EmailModule { } 