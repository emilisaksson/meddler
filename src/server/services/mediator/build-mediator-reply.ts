import { createMediatorProvider } from '../../integrations/anthropic/create-mediator-provider';
import type { MediatorReplyResult, MediatorTurnInput } from './types';

const mediatorProvider = createMediatorProvider();

export async function buildMediatorReply(
  input: MediatorTurnInput
): Promise<MediatorReplyResult> {
  return mediatorProvider.generateParticipantReply(input);
}
