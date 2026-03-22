import jwt from 'jsonwebtoken';
import { appConfig } from '../../app-config';
import { AppError } from '../../utils/app-error';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface NotificationLinkTokenPayload {
  sub: string;
  email: string;
  conversationId: string;
}

export function issueAccessToken(user: { id: string; email: string }): string {
  return jwt.sign({ email: user.email }, appConfig.jwt.secret, {
    subject: user.id,
    expiresIn: appConfig.jwt.expiresIn as jwt.SignOptions['expiresIn']
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      ('purpose' in decoded && decoded.purpose !== undefined)
    ) {
      throw new AppError('Invalid access token.', 401, {
        code: 'invalid_access_token'
      });
    }

    return {
      sub: decoded.sub,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Invalid or expired access token.', 401, {
      code: 'invalid_access_token'
    });
  }
}

export function issueNotificationLinkToken(user: {
  id: string;
  email: string;
  conversationId: string;
}): string {
  return jwt.sign(
    {
      email: user.email,
      conversationId: user.conversationId,
      purpose: 'notification-link'
    },
    appConfig.jwt.secret,
    {
      subject: user.id,
      expiresIn: `${appConfig.invite.expiryHours}h`
    }
  );
}

export function verifyNotificationLinkToken(token: string): NotificationLinkTokenPayload {
  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      decoded.purpose !== 'notification-link' ||
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.conversationId !== 'string'
    ) {
      throw new AppError('Invalid notification sign-in link.', 401, {
        code: 'invalid_notification_link'
      });
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      conversationId: decoded.conversationId
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Invalid or expired notification sign-in link.', 401, {
      code: 'invalid_notification_link'
    });
  }
}
