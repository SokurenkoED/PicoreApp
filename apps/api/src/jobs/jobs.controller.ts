import { Body, Controller, Get, Inject, Param, Post, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { JobsService } from './jobs.service';

@Controller('/api/jobs')
export class JobsController {
  constructor(@Inject(JobsService) private readonly jobsService: JobsService) {}

  @Post()
  async create(@Req() request: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply, @Body() body: unknown) {
    return this.jobsService.createJob(request, reply, body);
  }

  @Get('mine')
  async listMine(@Req() request: FastifyRequest) {
    return this.jobsService.listMyJobs(request);
  }

  @Get(':jobId')
  async getStatus(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Param('jobId') jobId: string
  ) {
    return this.jobsService.getJobStatus(request, reply, jobId);
  }
}
