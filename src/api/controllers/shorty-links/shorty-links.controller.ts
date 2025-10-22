import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Req,
    Res,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../../../common/guards/auth.guards';
import { ShortyLinksUsecase } from '../../../use-cases/shorty-links/shorty-links.use-case';
import { ShortenUrlDto } from '../../dtos/shorty-links.dto';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';

@ApiTags('shorty')
@ApiBearerAuth("JWT-auth")
@Controller()
export class ShortyLinksController {
    constructor(
        private readonly shortyLinksUsecase: ShortyLinksUsecase,
        private readonly logger: PinoLogger
    ) { }

    @Post('shorten')
    @UseGuards(AuthGuard)
    async shorten(@Body() dto: ShortenUrlDto, @Req() req) {
        try {
            const result = await this.shortyLinksUsecase.create(dto, req.user);

            this.logger.info(`Nova url encurtada ${result}`)

            return result
        } catch (error) {
            this.logger.error(`${error?.message}`)
            throw error;
        }
    }

    @Get('my-urls')
    @UseGuards(AuthGuard)
    async listMyUrls(@Req() req) {
        try {
            this.logger.info(`Listando todas urls de ${req.user.email}`)
            return await this.shortyLinksUsecase.getByUser(req.user.id);
        } catch (error) {
            this.logger.error(`${error?.message}`)
            throw error;
        }
    }

    @Put('my-urls/:id')
    @UseGuards(AuthGuard)
    async update(
        @Param('id') id: number,
        @Body() newUrl: ShortenUrlDto,
        @Req() req,
    ) {
        try {
            await this.shortyLinksUsecase.update(id, newUrl, req.user.id);

            this.logger.info(`Url alterada por ${req.user.email}`)

            return true;
        } catch (error) {
            this.logger.error(`${error?.message}`)
            throw error;
        }
    }

    @Delete('my-urls/:id')
    @UseGuards(AuthGuard)
    async delete(@Param('id') id: number, @Req() req) {
        try {
            await this.shortyLinksUsecase.delete(id, req.user.id);

            this.logger.info(`Url deletada por ${req.user.email}`)

            return { message: 'URL deletada com sucesso' };
        } catch (error) {
            this.logger.error(`${error?.message}`)
            throw error;
        }
    }

    @Get(':slug')
    async redirect(@Param('slug') slug: string, @Res() res: Response) {
        try {
            const url = await this.shortyLinksUsecase.getBySlug(slug);

            if (!url) {
                throw new BadRequestException();
            }

            if (url.deletedAt != null) {
                throw new BadRequestException();
            }

            await this.shortyLinksUsecase.increment(url?.id)

            return res.redirect(url?.originalUrl)

        } catch (error) {
            this.logger.error(`${error?.message}`)
            throw error;
        }
    }
}
