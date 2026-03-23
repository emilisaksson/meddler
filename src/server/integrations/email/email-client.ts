import { appConfig } from '../../app-config';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

function getMailgunMessagesUrl(domain: string): string {
  return new URL(`/v3/${domain}/messages`, `${appConfig.email.baseUrl}/`).toString();
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const messagesUrl = getMailgunMessagesUrl(appConfig.email.domain);
  const requestBody = new URLSearchParams({
    from: appConfig.email.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });

  const response = await fetch(messagesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${appConfig.email.apiKey}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: requestBody.toString()
  });

  if (response.ok) {
    return;
  }

  const responseBody = (await response.text()).trim();
  const failureDetails = responseBody.length > 0 ? ` ${responseBody}` : '';
  throw new Error(
    `Mailgun email request to ${messagesUrl} failed with ${response.status} ${response.statusText}.${failureDetails}`.trim()
  );
}
