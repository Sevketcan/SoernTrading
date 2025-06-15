import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UnsubscribeController } from './unsubscribe.controller';
import { UnsubscribeService } from './unsubscribe.service';
import { UnsubscribeProcessor } from './unsubscribe.processor';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [
        PrismaModule,
        EmailModule,
        BullModule.registerQueue({
            name: 'unsubscribe',
        }),
    ],
    controllers: [UnsubscribeController],
    providers: [UnsubscribeService, UnsubscribeProcessor],
    exports: [UnsubscribeService],
})
export class UnsubscribeModule { } 