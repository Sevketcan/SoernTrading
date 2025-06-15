import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LabelService, CreateLabelDto, UpdateLabelDto } from './label.service';

@Controller('labels')
@UseGuards(JwtAuthGuard)
export class LabelController {
    constructor(private readonly labelService: LabelService) { }

    @Post()
    async create(
        @Body() createLabelDto: CreateLabelDto,
        @Request() req: any,
    ) {
        return this.labelService.create(req.user.id, createLabelDto);
    }

    @Get()
    async findAll(@Request() req: any) {
        return this.labelService.findAll(req.user.id);
    }

    @Get('stats')
    async getLabelStats(@Request() req) {
        return this.labelService.getLabelStats(req.user.id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateLabelDto: UpdateLabelDto,
        @Request() req: any,
    ) {
        return this.labelService.update(id, req.user.id, updateLabelDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        await this.labelService.remove(id, req.user.id);
    }
} 