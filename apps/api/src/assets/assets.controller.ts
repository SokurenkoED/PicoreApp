import { Body, Controller, Get, Inject, Param, Post, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AssetsService } from './assets.service';

@Controller('/api/assets')
export class AssetsController {
  constructor(@Inject(AssetsService) private readonly assetsService: AssetsService) {}

  @Post('/presign-upload')
  async presignUpload(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body() body: unknown
  ) {
    return this.assetsService.presignUpload(request, reply, body);
  }

  @Post('/complete')
  async complete(@Req() request: FastifyRequest, @Body() body: unknown) {
    return this.assetsService.completeUpload(request, body);
  }

  @Get(':assetId/url')
  async getUrl(
    @Req() request: FastifyRequest,
    @Param('assetId') assetId: string,
    @Query('ttl') ttl?: string
  ) {
    return this.assetsService.getAssetUrl(request, assetId, ttl ? Number.parseInt(ttl, 10) : undefined);
  }
}
