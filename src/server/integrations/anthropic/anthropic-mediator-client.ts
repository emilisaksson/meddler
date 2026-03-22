import Anthropic from '@anthropic-ai/sdk';
import { appConfig } from '../../app-config';
import type {
  MediatorProvider,
  MediatorReplyResult,
  MediatorTurnInput
} from '../../services/mediator/types';
import { AppError } from '../../utils/app-error';

function formatHistory(input: MediatorTurnInput): string {
  return input.history
    .map((entry) => {
      if (entry.kind === 'participant') {
        return `[${entry.createdAt.toISOString()}] ${entry.actorKey} private message: ${entry.content}`;
      }

      return `[${entry.createdAt.toISOString()}] mediator reply to ${entry.recipientKey}: ${entry.content}`;
    })
    .join('\n');
}

export class AnthropicMediatorClient implements MediatorProvider {
  private readonly client: Anthropic;
  private readonly provider = 'anthropic';

  public constructor(private readonly model: string) {
    this.client = new Anthropic({
      apiKey: appConfig.anthropicApiKey
    });
  }

  public async generateParticipantReply(
    input: MediatorTurnInput
  ): Promise<MediatorReplyResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 450,
      temperature: 0.4,
      system: [
        'You are Olive, a calm and neutral AI mediator between two people on oliveaccord.',
        'You can see the full private history, but the recipient cannot see the other participant\'s raw messages.',
        'Rewrite the sender\'s meaning into language that is constructive, empathetic, and safe for the recipient.',
        'Do not mention hidden threads, do not quote the sender verbatim unless a short phrase is essential, and do not take sides.',
        'Acknowledge emotion, preserve the important intent, and offer one focused next step or question when it helps.',
        'If you identify that one participant clearly is in the wrong, you should highlight the issue in a clear way that allows the recipient to understand the problem and improve.',
        'Keep the reply between 90 and 180 words.',
        'Return plain text only.'
      ].join('\n'),
      messages: [
        {
          role: 'user',
          content: [
            `Conversation goal: ${input.goalLabel}`,
            `Issue description: ${input.issueDescription}`,
            `Sender role: ${input.senderKey}`,
            `Recipient role: ${input.recipientKey}`,
            `Sender personality profile:\n${input.senderPersonality ?? 'No saved profile.'}`,
            `Recipient personality profile:\n${input.recipientPersonality ?? 'No saved profile.'}`,
            `Latest private message from ${input.senderKey}: ${input.latestSenderMessage}`,
            'Conversation history:',
            formatHistory(input)
          ].join('\n\n')
        }
      ]
      });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text.trim())
      .join('\n')
      .trim();

    if (!text) {
      throw new AppError('The mediator provider returned an empty response.', 502, {
        code: 'empty_mediator_response'
      });
    }

    const inputTokens = response.usage.input_tokens ?? 0;
    const outputTokens = response.usage.output_tokens ?? 0;
    const cacheCreationInputTokens = response.usage.cache_creation_input_tokens ?? 0;
    const cacheReadInputTokens = response.usage.cache_read_input_tokens ?? 0;

    return {
      content: text,
      provider: this.provider,
      model: this.model,
      usage: {
        inputTokens,
        outputTokens,
        cacheCreationInputTokens,
        cacheReadInputTokens,
        totalTokens:
          inputTokens + outputTokens + cacheCreationInputTokens + cacheReadInputTokens
      }
    };
  }
}
