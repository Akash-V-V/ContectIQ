import { Controller, Post, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AiService } from './ai.service';
import { UsageService } from '../usage/usage.service';
import { AiActionDto } from './dto/ai-action.dto';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly usageService: UsageService,
  ) {}

  @Post('action')
  @UseGuards(JwtGuard)
  async action(@Body() dto: AiActionDto, @Req() req: any) {
    const userId = req.user.id;

    if (await this.usageService.hasExceededLimit(userId)) {
      throw new ForbiddenException('Free tier limit reached (50 actions/month). Please upgrade to Pro.');
    }

    const result = await this.aiService.runAction(dto);
    await this.usageService.increment(userId, dto.action);

    const count = await this.usageService.getCount(userId);

    return {
      success: true,
      result,
      usage: {
        count,
        limit: this.usageService.FREE_TIER_LIMIT,
        remaining: this.usageService.FREE_TIER_LIMIT - count,
      },
    };
  }
}