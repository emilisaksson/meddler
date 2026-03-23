import { appConfig } from '../../app-config';
import { sendEmail } from '../../integrations/email/email-client';
import { buildOtpEmailTemplate } from '../../integrations/email/email-templates';
import { OtpChallengeModel } from '../../integrations/mongodb/models/otp-challenge-model';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { generateOtpCode, hashSecret } from '../../utils/crypto';
import { addMinutes } from '../../utils/dates';
import { normalizeEmail } from '../../utils/email';
import { ensureUserLocale, resolveLocale } from '../../utils/locale';

export async function requestOtp(input: {
  email: string;
  language?: string | null;
  country?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const otpCode = generateOtpCode();
  const now = new Date();
  const user = await UserModel.findOne({ email }).exec();

  if (user) {
    const locale = ensureUserLocale(user, {
      language: input.language,
      country: input.country
    });

    if (locale.changed) {
      await user.save();
    }
  }

  await OtpChallengeModel.deleteMany({ email }).exec();
  await OtpChallengeModel.create({
    email,
    codeHash: hashSecret(otpCode),
    attemptCount: 0,
    expiresAt: addMinutes(now, appConfig.otp.expiryMinutes),
    consumedAt: null
  });

  const locale = user
    ? resolveLocale({
        language: user.language,
        country: user.country
      })
    : resolveLocale({
        language: input.language,
        country: input.country
      });
  const emailTemplate = buildOtpEmailTemplate({
    code: otpCode,
    expiryMinutes: appConfig.otp.expiryMinutes,
    language: locale.language
  });

  await sendEmail({
    to: email,
    ...emailTemplate
  });

  return {
    email,
    expiresInMinutes: appConfig.otp.expiryMinutes
  };
}
