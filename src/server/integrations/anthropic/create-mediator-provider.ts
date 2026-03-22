import { appConfig } from '../../app-config';
import { AppError } from '../../utils/app-error';
import { AnthropicMediatorClient } from './anthropic-mediator-client';

export function createMediatorProvider() {
  const [provider, ...modelParts] = appConfig.agentModel.split(':');
  const resolvedProvider = modelParts.length > 0 ? provider : 'anthropic';
  const resolvedModel = modelParts.length > 0 ? modelParts.join(':') : appConfig.agentModel;

  if (resolvedProvider !== 'anthropic') {
    throw new AppError(`Unsupported mediator provider "${resolvedProvider}".`, 500, {
      code: 'unsupported_mediator_provider'
    });
  }

  return new AnthropicMediatorClient(resolvedModel);
}
