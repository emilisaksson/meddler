import { Router } from 'express';
import { z } from 'zod';
import { acceptInvitation } from '../../helpers/auth/accept-invitation';
import { buildPublicUserResponse } from '../../helpers/auth/build-public-user-response';
import { requestOtp } from '../../helpers/auth/request-otp';
import { savePersonality } from '../../helpers/auth/save-personality';
import { signInWithNotificationLink } from '../../helpers/auth/sign-in-with-notification-link';
import { updateProfile } from '../../helpers/auth/update-profile';
import { verifyOtp } from '../../helpers/auth/verify-otp';
import { UserModel } from '../../integrations/mongodb/models/user-model';
import { asyncHandler } from '../../utils/async-handler';
import { ensureUserLocale } from '../../utils/locale';
import { authenticateRequest, requireAuth } from '../middlewares/authenticate-request';
import { AppError } from '../../utils/app-error';

const optionalNullableString = (maxLength: number) =>
  z.string().trim().max(maxLength).nullable().optional();

const requestOtpSchema = z.object({
  email: z.string().trim().email(),
  language: optionalNullableString(16),
  country: optionalNullableString(8)
});

const verifyOtpSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().length(6),
  name: z.string().trim().max(80).optional(),
  language: optionalNullableString(16),
  country: optionalNullableString(8)
});

const acceptInvitationSchema = z.object({
  token: z.string().trim().min(1),
  language: optionalNullableString(16),
  country: optionalNullableString(8)
});

const notificationLinkSchema = z.object({
  token: z.string().trim().min(1),
  language: optionalNullableString(16),
  country: optionalNullableString(8)
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  language: optionalNullableString(16),
  country: optionalNullableString(8)
});

const savePersonalitySchema = z.object({
  responses: z
    .array(
      z.object({
        questionId: z.string().trim().min(1).max(64),
        answer: z.string().trim().max(2_000).nullable().optional()
      })
    )
    .min(1)
    .max(10)
});

export const authRoutes = Router();

authRoutes.post(
  '/request-otp',
  asyncHandler('auth.requestOtp', async (request, response) => {
    const payload = requestOtpSchema.parse(request.body);
    const result = await requestOtp(payload);
    response.status(202).json(result);
  })
);

authRoutes.post(
  '/verify-otp',
  asyncHandler('auth.verifyOtp', async (request, response) => {
    const payload = verifyOtpSchema.parse(request.body);
    const result = await verifyOtp(payload);
    response.json(result);
  })
);

authRoutes.post(
  '/accept-invitation',
  asyncHandler('auth.acceptInvitation', async (request, response) => {
    const payload = acceptInvitationSchema.parse(request.body);
    const result = await acceptInvitation(payload);
    response.json(result);
  })
);

authRoutes.post(
  '/notification-link',
  asyncHandler('auth.notificationLink', async (request, response) => {
    const payload = notificationLinkSchema.parse(request.body);
    const result = await signInWithNotificationLink(payload);
    response.json(result);
  })
);

authRoutes.get(
  '/me',
  authenticateRequest,
  asyncHandler('auth.me', async (request, response) => {
    const auth = requireAuth(request);
    const user = await UserModel.findById(auth.sub).exec();

    if (!user) {
      throw new AppError('Authenticated user was not found.', 404, {
        code: 'user_not_found'
      });
    }

    const locale = ensureUserLocale(user);

    if (locale.changed) {
      await user.save();
    }

    response.json({
      user: buildPublicUserResponse(user)
    });
  })
);

authRoutes.patch(
  '/profile',
  authenticateRequest,
  asyncHandler('auth.updateProfile', async (request, response) => {
    const auth = requireAuth(request);
    const payload = updateProfileSchema.parse(request.body);
    const result = await updateProfile({
      userId: auth.sub,
      name: payload.name,
      language: payload.language,
      country: payload.country
    });

    response.json(result);
  })
);

authRoutes.put(
  '/personality',
  authenticateRequest,
  asyncHandler('auth.savePersonality', async (request, response) => {
    const auth = requireAuth(request);
    const payload = savePersonalitySchema.parse(request.body);
    const result = await savePersonality({
      userId: auth.sub,
      responses: payload.responses
    });

    response.json(result);
  })
);
