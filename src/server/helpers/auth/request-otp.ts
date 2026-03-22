import { appConfig } from '../../app-config';
import { sendEmail } from '../../integrations/email/email-client';
import { buildOtpEmailTemplate } from '../../integrations/email/email-templates';
import { OtpChallengeModel } from '../../integrations/mongodb/models/otp-challenge-model';
import { generateOtpCode, hashSecret } from '../../utils/crypto';
import { addMinutes } from '../../utils/dates';
import { normalizeEmail } from '../../utils/email';

export async function requestOtp(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const otpCode = generateOtpCode();
  const now = new Date();

  await OtpChallengeModel.deleteMany({ email }).exec();
  await OtpChallengeModel.create({
    email,
    codeHash: hashSecret(otpCode),
    attemptCount: 0,
    expiresAt: addMinutes(now, appConfig.otp.expiryMinutes),
    consumedAt: null
  });

  const emailTemplate = buildOtpEmailTemplate(otpCode, appConfig.otp.expiryMinutes);

  await sendEmail({
    to: email,
    ...emailTemplate
  });

  return {
    email,
    expiresInMinutes: appConfig.otp.expiryMinutes
  };
}
