import { UserModel } from '../../integrations/mongodb/models/user-model';
import { AppError } from '../../utils/app-error';
import { normalizeCountry, normalizeLanguage, normalizeOptionalText } from '../../utils/text';
import { buildPublicUserResponse } from './build-public-user-response';

export async function updateProfile(input: {
  userId: string;
  name: string;
  language?: string | null;
  country?: string | null;
}) {
  const user = await UserModel.findById(input.userId).exec();

  if (!user) {
    throw new AppError('Authenticated user was not found.', 404, {
      code: 'user_not_found'
    });
  }

  const name = normalizeOptionalText(input.name);

  if (!name) {
    throw new AppError('A name is required.', 400, {
      code: 'name_required'
    });
  }

  user.name = name;
  user.language = normalizeLanguage(input.language) ?? user.language ?? null;
  user.country = normalizeCountry(input.country) ?? user.country ?? null;

  await user.save();

  return {
    user: buildPublicUserResponse(user)
  };
}
