import { ConversationModel } from '../../integrations/mongodb/models/conversation-model';
import { OtpChallengeModel } from '../../integrations/mongodb/models/otp-challenge-model';

export async function pruneExpiredArtifacts() {
  const now = new Date();

  const [otpResult, conversationResult] = await Promise.all([
    OtpChallengeModel.deleteMany({
      expiresAt: {
        $lt: now
      }
    }).exec(),
    ConversationModel.updateMany(
      {
        status: 'pending',
        'invitation.expiresAt': {
          $lt: now
        }
      },
      {
        $set: {
          status: 'expired'
        }
      }
    ).exec()
  ]);

  return {
    deletedOtpChallenges: otpResult.deletedCount ?? 0,
    expiredPendingConversations: conversationResult.modifiedCount ?? 0
  };
}
