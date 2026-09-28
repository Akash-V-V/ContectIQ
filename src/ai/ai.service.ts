import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { AiActionDto, AiAction } from './dto/ai-action.dto';

@Injectable()
export class AiService {
  private client: Groq;

  constructor(private config: ConfigService) {
    this.client = new Groq({
      apiKey: this.config.get<string>('GROQ_API_KEY'),
    });
  }

  private buildPrompt(dto: AiActionDto): string {
    switch (dto.action) {
      case AiAction.SUMMARIZE:
        return `Summarize the following content into 3-5 clear bullet points. Be concise and capture the key information.\n\nContent:\n${dto.content}`;
      case AiAction.REWRITE:
        return `Rewrite the following text in a ${dto.tone || 'formal'} tone. Return only the rewritten text, nothing else.\n\nText:\n${dto.content}`;
      case AiAction.TRANSLATE:
        return `Translate the following text to ${dto.targetLanguage || 'English'}. Preserve the tone and meaning. Return only the translation.\n\nText:\n${dto.content}`;
      case AiAction.REPLY:
        return `Draft a professional and contextually appropriate reply to the following message or thread. Return only the reply text.\n\nMessage:\n${dto.content}`;
      case AiAction.EXPLAIN:
        return `Explain the following text in simple, plain English. Assume the reader is unfamiliar with the topic.\n\nText:\n${dto.content}`;
      default:
        throw new BadRequestException('Unknown action');
    }
  }

  async runAction(dto: AiActionDto): Promise<string> {
    const prompt = this.buildPrompt(dto);

    const completion = await this.client.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) throw new BadRequestException('No response from AI');
    return result;
  }
}