function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildOtpEmailTemplate(code: string, expiryMinutes: number) {
  return {
    subject: 'Your oliveaccord sign-in code',
    text: `Your oliveaccord sign-in code is ${code}. It expires in ${expiryMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #132a2f;">
        <h1 style="margin-bottom: 12px;">oliveaccord sign-in code</h1>
        <p>Use the following one-time code to sign in:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${escapeHtml(code)}</p>
        <p>This code expires in ${expiryMinutes} minutes.</p>
      </div>
    `
  };
}

export function buildInvitationEmailTemplate(input: {
  issueDescription: string;
  goalLabel: string;
  acceptUrl: string;
}) {
  return {
    subject: 'You have been invited to a mediated conversation',
    text: `You have been invited to oliveaccord.\n\nGoal: ${input.goalLabel}\nIssue: ${input.issueDescription}\n\nOpen this secure link to accept the invitation and join automatically:\n${input.acceptUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #132a2f; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">You have been invited to oliveaccord</h1>
        <p>The other participant chose the goal <strong>${escapeHtml(input.goalLabel)}</strong>.</p>
        <p><strong>Issue description:</strong></p>
        <blockquote style="margin: 0; padding: 12px 16px; background: #eef5f1; border-left: 4px solid #4f8f73;">
          ${escapeHtml(input.issueDescription)}
        </blockquote>
        <p style="margin-top: 20px;">Use the secure link below to accept the invitation and join automatically:</p>
        <p>
          <a href="${escapeHtml(input.acceptUrl)}" style="display: inline-block; background: #173f45; color: white; text-decoration: none; padding: 12px 18px; border-radius: 999px;">
            Join the conversation
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p>${escapeHtml(input.acceptUrl)}</p>
      </div>
    `
  };
}

export function buildMediatorNotificationEmailTemplate(input: {
  goalLabel: string;
  openConversationUrl: string;
}) {
  return {
    subject: 'Olive has a new message for you',
    text: `Olive has prepared a new message for your conversation on oliveaccord about "${input.goalLabel}".\n\nOpen this secure link to sign in automatically and view the conversation:\n${input.openConversationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #132a2f; line-height: 1.6;">
        <h1 style="margin-bottom: 12px;">A new Olive message is waiting</h1>
        <p>Your conversation goal is <strong>${escapeHtml(input.goalLabel)}</strong>.</p>
        <p>Use the secure link below to sign in automatically and open your private thread.</p>
        <p>
          <a href="${escapeHtml(input.openConversationUrl)}" style="display: inline-block; background: #173f45; color: white; text-decoration: none; padding: 12px 18px; border-radius: 999px;">
            Open conversation
          </a>
        </p>
        <p>If the button does not work, open this link:</p>
        <p>${escapeHtml(input.openConversationUrl)}</p>
      </div>
    `
  };
}
