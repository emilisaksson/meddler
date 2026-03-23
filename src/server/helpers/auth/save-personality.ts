import { UserModel } from '../../integrations/mongodb/models/user-model';
import { AppError } from '../../utils/app-error';
import { ensureUserLocale } from '../../utils/locale';
import { buildPublicUserResponse } from './build-public-user-response';
import {
  buildPersonalityResponses,
  generatePersonalityMarkdown
} from './personality-profile';

export async function savePersonality(input: {
  userId: string;
  responses: Array<{
    questionId: string;
    answer?: string | null;
  }>;
}) {
  const user = await UserModel.findById(input.userId).exec();

  if (!user) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  const responses = buildPersonalityResponses(input.responses);

  if (responses.length === 0) {
    throw new AppError('At least one personality question must be submitted.', 400, {
      code: 'personality_questions_required'
    });
  }

  user.personalityResponses = responses;
  user.personality = generatePersonalityMarkdown(user, responses);
  ensureUserLocale(user);

  await user.save();

  return {
    user: buildPublicUserResponse(user)
  };
}
