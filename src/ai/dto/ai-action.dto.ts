import { IsEnum, IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export enum AiAction {
  SUMMARIZE = 'summarize',
  REWRITE = 'rewrite',
  TRANSLATE = 'translate',
  REPLY = 'reply',
  EXPLAIN = 'explain',
}

export enum RewriteTone {
  FORMAL = 'formal',
  CASUAL = 'casual',
  SHORTER = 'shorter',
  SIMPLER = 'simpler',
  PERSUASIVE = 'persuasive',
  BULLET_POINTS = 'bullet_points',
}

export class AiActionDto {
  @IsEnum(AiAction)
  action: AiAction;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsEnum(RewriteTone)
  tone?: RewriteTone;

  @IsOptional()
  @IsString()
  targetLanguage?: string;
}