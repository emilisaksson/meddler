import { getSupportedEmailLanguage, type SupportedEmailLanguage } from '../../utils/locale';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const EMAIL_LOGO_CID = 'oliveaccord-logo.png';

const goalLabelsByLanguage: Record<SupportedEmailLanguage, Record<string, string>> = {
  en: {
    'solve-a-disagreement': 'Solve a disagreement',
    'work-out-a-relationship-issue': 'Work out a relationship issue',
    'get-to-know-each-other-better': 'Get to know each other better',
    'rebuild-trust-after-a-hurt': 'Rebuild trust after a hurt',
    'set-healthier-boundaries': 'Set healthier boundaries',
    'make-a-shared-decision': 'Make a shared decision'
  },
  sv: {
    'solve-a-disagreement': 'Lösa en konflikt',
    'work-out-a-relationship-issue': 'Bearbeta ett relationsproblem',
    'get-to-know-each-other-better': 'Lära känna varandra bättre',
    'rebuild-trust-after-a-hurt': 'Återbygga tillit efter en sårande händelse',
    'set-healthier-boundaries': 'Sätta sundare gränser',
    'make-a-shared-decision': 'Fatta ett gemensamt beslut'
  }
};

function renderEmailLayout(title: string, bodyHtml: string): string {
  return `
    <div style="background: #f3f7f4; padding: 32px 16px;">
      <div style="max-width: 620px; margin: 0 auto; border-radius: 24px; background: #ffffff; padding: 32px 28px; font-family: Arial, sans-serif; color: #132a2f; line-height: 1.6;">
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="cid:${EMAIL_LOGO_CID}" alt="oliveaccord" style="display: block; max-width: 220px; width: 100%; height: auto; margin: 0 auto;">
        </div>
        <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">${escapeHtml(title)}</h1>
        ${bodyHtml}
      </div>
    </div>
  `;
}

function renderButton(label: string, url: string): string {
  return `
    <p style="margin: 20px 0 16px;">
      <a href="${escapeHtml(url)}" style="display: inline-block; border-radius: 999px; background: #173f45; color: #ffffff; text-decoration: none; padding: 12px 18px; font-weight: 700;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}

function getLocalizedGoalLabel(
  goalKey: string,
  fallbackLabel: string,
  language: SupportedEmailLanguage
): string {
  return goalLabelsByLanguage[language][goalKey] ?? fallbackLabel;
}

export function buildOtpEmailTemplate(input: {
  code: string;
  expiryMinutes: number;
  language?: string | null;
}) {
  const language = getSupportedEmailLanguage(input.language);

  if (language === 'sv') {
    return {
      subject: 'Din inloggningskod till oliveaccord',
      text: `Din engångskod för oliveaccord är ${input.code}. Den gäller i ${input.expiryMinutes} minuter.`,
      html: renderEmailLayout(
        'Din inloggningskod',
        `
          <p style="margin: 0 0 16px;">Använd följande engångskod för att logga in:</p>
          <p style="margin: 0 0 16px; font-size: 32px; font-weight: 700; letter-spacing: 6px;">${escapeHtml(input.code)}</p>
          <p style="margin: 0;">Koden gäller i ${input.expiryMinutes} minuter.</p>
        `
      )
    };
  }

  return {
    subject: 'Your oliveaccord sign-in code',
    text: `Your oliveaccord sign-in code is ${input.code}. It expires in ${input.expiryMinutes} minutes.`,
    html: renderEmailLayout(
      'oliveaccord sign-in code',
      `
        <p style="margin: 0 0 16px;">Use the following one-time code to sign in:</p>
        <p style="margin: 0 0 16px; font-size: 32px; font-weight: 700; letter-spacing: 6px;">${escapeHtml(input.code)}</p>
        <p style="margin: 0;">This code expires in ${input.expiryMinutes} minutes.</p>
      `
    )
  };
}

export function buildInvitationEmailTemplate(input: {
  language?: string | null;
  goalKey: string;
  issueDescription: string;
  goalLabel: string;
  acceptUrl: string;
}) {
  const language = getSupportedEmailLanguage(input.language);
  const goalLabel = getLocalizedGoalLabel(input.goalKey, input.goalLabel, language);

  if (language === 'sv') {
    return {
      subject: 'Du har blivit inbjuden till ett medlat samtal',
      text: `Du har blivit inbjuden till oliveaccord.\n\nMål: ${goalLabel}\nProblem: ${input.issueDescription}\n\nÖppna den här säkra länken för att acceptera inbjudan och ansluta automatiskt:\n${input.acceptUrl}`,
      html: renderEmailLayout(
        'Du har blivit inbjuden till oliveaccord',
        `
          <p style="margin: 0 0 16px;">Den andra deltagaren valde målet <strong>${escapeHtml(goalLabel)}</strong>.</p>
          <p style="margin: 0 0 8px;"><strong>Problembeskrivning:</strong></p>
          <blockquote style="margin: 0 0 20px; padding: 12px 16px; background: #eef5f1; border-left: 4px solid #4f8f73; white-space: pre-line;">${escapeHtml(input.issueDescription)}</blockquote>
          <p style="margin: 0;">Använd den säkra länken nedan för att acceptera inbjudan och ansluta automatiskt:</p>
          ${renderButton('Gå med i samtalet', input.acceptUrl)}
          <p style="margin: 0 0 8px;">Om knappen inte fungerar kan du öppna länken:</p>
          <p style="margin: 0; word-break: break-word;">${escapeHtml(input.acceptUrl)}</p>
        `
      )
    };
  }

  return {
    subject: 'You have been invited to a mediated conversation',
    text: `You have been invited to oliveaccord.\n\nGoal: ${goalLabel}\nIssue: ${input.issueDescription}\n\nOpen this secure link to accept the invitation and join automatically:\n${input.acceptUrl}`,
    html: renderEmailLayout(
      'You have been invited to oliveaccord',
      `
        <p style="margin: 0 0 16px;">The other participant chose the goal <strong>${escapeHtml(goalLabel)}</strong>.</p>
        <p style="margin: 0 0 8px;"><strong>Issue description:</strong></p>
        <blockquote style="margin: 0 0 20px; padding: 12px 16px; background: #eef5f1; border-left: 4px solid #4f8f73; white-space: pre-line;">${escapeHtml(input.issueDescription)}</blockquote>
        <p style="margin: 0;">Use the secure link below to accept the invitation and join automatically:</p>
        ${renderButton('Join the conversation', input.acceptUrl)}
        <p style="margin: 0 0 8px;">If the button does not work, open this link:</p>
        <p style="margin: 0; word-break: break-word;">${escapeHtml(input.acceptUrl)}</p>
      `
    )
  };
}

export function buildMediatorNotificationEmailTemplate(input: {
  language?: string | null;
  goalKey: string;
  goalLabel: string;
  openConversationUrl: string;
}) {
  const language = getSupportedEmailLanguage(input.language);
  const goalLabel = getLocalizedGoalLabel(input.goalKey, input.goalLabel, language);

  if (language === 'sv') {
    return {
      subject: 'Olive har ett nytt meddelande till dig',
      text: `Olive har förberett ett nytt meddelande i ditt samtal på oliveaccord om "${goalLabel}".\n\nÖppna den här säkra länken för att logga in automatiskt och visa samtalet:\n${input.openConversationUrl}`,
      html: renderEmailLayout(
        'Ett nytt meddelande från Olive väntar',
        `
          <p style="margin: 0 0 16px;">Målet för samtalet är <strong>${escapeHtml(goalLabel)}</strong>.</p>
          <p style="margin: 0;">Använd den säkra länken nedan för att logga in automatiskt och öppna din privata tråd.</p>
          ${renderButton('Öppna samtalet', input.openConversationUrl)}
          <p style="margin: 0 0 8px;">Om knappen inte fungerar kan du öppna länken:</p>
          <p style="margin: 0; word-break: break-word;">${escapeHtml(input.openConversationUrl)}</p>
        `
      )
    };
  }

  return {
    subject: 'Olive has a new message for you',
    text: `Olive has prepared a new message for your conversation on oliveaccord about "${goalLabel}".\n\nOpen this secure link to sign in automatically and view the conversation:\n${input.openConversationUrl}`,
    html: renderEmailLayout(
      'A new Olive message is waiting',
      `
        <p style="margin: 0 0 16px;">Your conversation goal is <strong>${escapeHtml(goalLabel)}</strong>.</p>
        <p style="margin: 0;">Use the secure link below to sign in automatically and open your private thread.</p>
        ${renderButton('Open conversation', input.openConversationUrl)}
        <p style="margin: 0 0 8px;">If the button does not work, open this link:</p>
        <p style="margin: 0; word-break: break-word;">${escapeHtml(input.openConversationUrl)}</p>
      `
    )
  };
}
