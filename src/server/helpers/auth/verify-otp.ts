import { appConfig } from '../../app-config';
import { OtpChallengeModel } from '../../integrations/mongodb/models/otp-challenge-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { INITIAL_USER_CREDITS } from '../../services/billing/credits';
import { issueAccessToken } from '../../services/tokens/jwt-service';
import { AppError } from '../../utils/app-error';
import { hashSecret } from '../../utils/crypto';
import { normalizeEmail } from '../../utils/email';
import { ensureUserLocale } from '../../utils/locale';
import { normalizeOptionalText } from '../../utils/text';
import { buildPublicUserResponse } from './build-public-user-response';

export async function verifyOtp(input: {
  email: string;
  code: string;
  name?: string | null;
  language?: string | null;
  country?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const code = input.code.trim();

  const challenge = await OtpChallengeModel.findOne({
    email,
    consumedAt: null
  })
    .sort({ createdAt: -1 })
    .exec();

  if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
    throw new AppError('The one-time code is invalid or expired.', 400, {
      code: 'otp_expired'
    });
  }

  if (challenge.attemptCount >= appConfig.otp.maxAttempts) {
    throw new AppError('Too many invalid code attempts.', 429, {
      code: 'otp_attempt_limit_reached'
    });
  }

  if (hashSecret(code) !== challenge.codeHash) {
    challenge.attemptCount += 1;
    await challenge.save();

    throw new AppError('The one-time code is invalid.', 400, {
      code: 'otp_invalid'
    });
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  const user = await UserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        lastLoggedInAt: new Date()
      },
      $setOnInsert: {
        email,
        credits: INITIAL_USER_CREDITS,
        personality: null,
        personalityResponses: []
      }
    },
    {
      upsert: true,
      new: true
    }
  ).exec();

  if (!user) {
    throw new AppError('Unable to sign in.', 500, {
      code: 'user_upsert_failed'
    });
  }

  const name = normalizeOptionalText(input.name);

  if (!user.name && name) {
    user.name = name;
  }

  ensureUserLocale(user, {
    language: input.language,
    country: input.country
  });

  await user.save();

  return {
    accessToken: issueAccessToken({
      id: user.id,
      email: user.email
    }),
    user: buildPublicUserResponse(user)
  };
}
