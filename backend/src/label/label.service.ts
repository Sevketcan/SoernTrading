import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateLabelDto {
    name: string;
    color?: string;
}

export interface UpdateLabelDto {
    name?: string;
    color?: string;
}

@Injectable()
export class LabelService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createLabelDto: CreateLabelDto) {
        const { name, color = '#3B82F6' } = createLabelDto;

        // Check if label with this name already exists for the user
        const existingLabel = await this.prisma.label.findFirst({
            where: {
                userId,
                name,
            },
        });

        if (existingLabel) {
            throw new ConflictException('Label with this name already exists');
        }

        return this.prisma.label.create({
            data: {
                name,
                color,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.label.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string, userId: string) {
        const label = await this.prisma.label.findFirst({
            where: { id, userId },
        });

        if (!label) {
            throw new NotFoundException('Label not found');
        }

        return label;
    }

    async update(id: string, userId: string, updateLabelDto: UpdateLabelDto) {
        // First check if label exists and belongs to user
        await this.findOne(id, userId);

        // If updating name, check for conflicts
        if (updateLabelDto.name) {
            const existingLabel = await this.prisma.label.findFirst({
                where: {
                    userId,
                    name: updateLabelDto.name,
                    NOT: { id }, // Exclude current label
                },
            });

            if (existingLabel) {
                throw new ConflictException('Label with this name already exists');
            }
        }

        return this.prisma.label.update({
            where: { id },
            data: updateLabelDto,
        });
    }

    async remove(id: string, userId: string) {
        // First check if label exists and belongs to user
        const label = await this.findOne(id, userId);

        // Remove label from all emails that use it
        const emailsWithLabel = await this.prisma.email.findMany({
            where: {
                userId,
                labels: {
                    has: label.name,
                },
            },
        });

        // Update emails to remove this label
        for (const email of emailsWithLabel) {
            await this.prisma.email.update({
                where: { id: email.id },
                data: {
                    labels: email.labels.filter(l => l !== label.name),
                },
            });
        }

        // Delete the label
        return this.prisma.label.delete({
            where: { id },
        });
    }

    async getLabelStats(userId: string) {
        const labels = await this.findAll(userId);
        const stats: any[] = [];

        for (const label of labels) {
            const emailCount = await this.prisma.email.count({
                where: {
                    userId,
                    labels: {
                        has: label.name,
                    },
                },
            });

            stats.push({
                id: label.id,
                name: label.name,
                color: label.color,
                emailCount,
            });
        }

        return stats;
    }
} 