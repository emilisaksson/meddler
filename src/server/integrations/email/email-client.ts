import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { appConfig } from '../../app-config';
import { EMAIL_LOGO_CID } from './email-templates';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let emailLogoPromise: Promise<Blob | null> | null = null;

function getMailgunMessagesUrl(domain: string): string {
  return new URL(`/v3/${domain}/messages`, `${appConfig.email.baseUrl}/`).toString();
}

async function getInlineEmailLogo(): Promise<Blob | null> {
  if (!emailLogoPromise) {
    const logoPath = resolve(process.cwd(), 'frontend', 'public', 'logo.png');
    emailLogoPromise = readFile(logoPath)
      .then((logoBuffer) => new Blob([logoBuffer], { type: 'image/png' }))
      .catch((error) => {
        console.warn('Unable to load the oliveaccord logo for email delivery.', error);
        return null;
      });
  }

  return emailLogoPromise;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const messagesUrl = getMailgunMessagesUrl(appConfig.email.domain);
  const requestBody = new FormData();
  requestBody.set('from', appConfig.email.from);
  requestBody.set('to', payload.to);
  requestBody.set('subject', payload.subject);
  requestBody.set('text', payload.text);
  requestBody.set('html', payload.html);

  const emailLogo = await getInlineEmailLogo();

  if (emailLogo) {
    requestBody.append('inline', emailLogo, EMAIL_LOGO_CID);
  }

  const response = await fetch(messagesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${appConfig.email.apiKey}`).toString('base64')}`
    },
    body: requestBody
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
