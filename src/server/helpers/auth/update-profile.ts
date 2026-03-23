import { UserModel } from '../../integrations/mongodb/models/user-model';
import { AppError } from '../../utils/app-error';
import { ensureUserLocale, resolveLocale } from '../../utils/locale';
import { normalizeOptionalText } from '../../utils/text';
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

  if (input.language !== undefined || input.country !== undefined) {
    const locale = resolveLocale({
      language: input.language ?? user.language,
      country: input.country,
      fallbackLanguage: user.language,
      fallbackCountry: user.country
    });

    user.language = locale.language;
    user.country = locale.country;
  } else {
    ensureUserLocale(user);
  }

  await user.save();

  return {
    user: buildPublicUserResponse(user)
  };
}
