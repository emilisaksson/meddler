import { Injectable, signal } from '@angular/core';
import type { ConversationTurnState } from '../models/api.models';

type SupportedUiLanguage = 'en' | 'sv';

interface BrowserProfile {
  locale: string;
  language: string;
  country: string | null;
  uiLanguage: SupportedUiLanguage;
  languageLabel: string;
  countryLabel: string | null;
}

const translations = {
  en: {
    'app.brand': 'oliveaccord',
    'app.tagline': 'Private AI-mediated conversations',
    'app.subtitle':
      'Private threads, calmer wording, and structured progress through difficult conversations.',
    'app.signedInAs': 'Signed in as',
    'app.creditsBalance': 'Credits:',
    'app.logout': 'Log out',
    'login.eyebrow': 'Private mediation',
    'login.heroTitle': 'A calmer way to handle a hard conversation.',
    'login.heroBody':
      'Each person gets a private thread with Olive. You can write honestly, Olive reframes the message, and the other person only sees the clearer version.',
    'login.featureOtpTitle': 'OTP sign-in',
    'login.featureOtpBody': 'Use a one-time code sent to your email.',
    'login.featureThreadsTitle': 'Private threads',
    'login.featureThreadsBody': 'Each participant only sees their own thread.',
    'login.featureGoalsTitle': 'Structured goals',
    'login.featureGoalsBody': 'Start with an issue and a clear intent.',
    'login.howItWorksEyebrow': 'How it works',
    'login.howItWorksTitle':
      'oliveaccord keeps difficult conversations private, structured, and easier to handle.',
    'login.howItWorksBody':
      'There is no shared chat room. Olive mediates between two private threads and carries the conversation forward step by step.',
    'login.howStep1Title': 'Start with the issue',
    'login.howStep1Body':
      'Sign in, invite the other person, and describe what feels difficult and what you hope will improve.',
    'login.howStep2Title': 'Write privately to Olive',
    'login.howStep2Body':
      'Each participant sends messages only in their own private thread, so raw wording is never shown directly to the other person.',
    'login.howStep3Title': 'Receive a calmer response',
    'login.howStep3Body':
      'Olive relays the intent in clearer, more constructive language so both sides can keep moving forward.',
    'login.privacyPill': 'Private threads',
    'login.rawMessagesPill': 'No exposed raw messages',
    'login.guidedPill': 'Olive guides the exchange',
    'login.signInEyebrow': 'Sign in',
    'login.headingRequest': 'Get your one-time code',
    'login.headingVerify': 'Finish your registration',
    'login.bodyRequest': 'We will send a one-time code to your email address.',
    'login.bodyVerify': 'Enter the code and add your name to finish registration.',
    'login.emailLabel': 'Email address',
    'login.emailPlaceholder': 'you@example.com',
    'login.nameLabel': 'Your name',
    'login.namePlaceholder': 'Enter your name',
    'login.codeLabel': 'One-time code',
    'login.languageLabel': 'Language',
    'login.countryLabel': 'Country',
    'login.sendCode': 'Send code',
    'login.verifyCode': 'Verify code',
    'login.useAnotherEmail': 'Use another email',
    'login.sendCodeError': 'Could not send the one-time code.',
    'login.verifyCodeError': 'Could not verify the one-time code.',
    'accept.eyebrow': 'Invitation',
    'accept.loadingTitle': 'Accepting invitation',
    'accept.loadingBody':
      'We are signing you in automatically and opening the private conversation thread.',
    'accept.errorTitle': 'We could not open this invitation',
    'accept.errorFallback': 'This invitation has expired or is no longer valid.',
    'accept.goToSignIn': 'Go to sign in',
    'notification.eyebrow': 'Secure link',
    'notification.loadingTitle': 'Opening conversation',
    'notification.loadingBody':
      'We are signing you in automatically and opening the latest private conversation thread.',
    'notification.errorTitle': 'We could not open this conversation',
    'notification.errorFallback': 'This secure link has expired or is no longer valid.',
    'notification.goToSignIn': 'Go to sign in',
    'profile.eyebrow': 'Complete profile',
    'profile.title': 'Before you start chatting',
    'profile.body':
      'Add your name so Olive can address you properly. Language preferences from your browser are applied automatically.',
    'profile.nameLabel': 'Name',
    'profile.namePlaceholder': 'Enter the name you want to use',
    'profile.save': 'Continue',
    'profile.saveError': 'Could not save your profile.',
    'personality.eyebrow': 'Personality profile',
    'personality.title': 'Help Olive understand you',
    'personality.body':
      'Answer a few short questions so future replies can match your communication style and background more closely.',
    'personality.answerLabel': 'Your answer',
    'personality.placeholder': 'Write as much or as little as you want.',
    'personality.finish': 'Finish now',
    'personality.saveAndContinue': 'Save and continue',
    'personality.saveAndFinish': 'Save and finish',
    'personality.saveError': 'Could not save your personality profile.',
    'conversations.inviteEyebrow': 'Invite someone',
    'conversations.inviteTitle': 'Start a mediated conversation',
    'conversations.inviteBody':
      'Invite another person by email, describe the issue, and choose a goal to give Olive context before the first reply.',
    'conversations.inviteeEmailLabel': 'Invite by email',
    'conversations.inviteeEmailPlaceholder': 'other-person@example.com',
    'conversations.goalLabel': 'I want to:',
    'conversations.goalPlaceholder': 'Choose a goal',
    'conversations.issueLabel': 'Describe the issue',
    'conversations.issuePlaceholder':
      'Describe what is happening, what feels difficult, and what you hope improves.',
    'conversations.sendInvite': 'Send invitation',
    'conversations.devLinkTitle': 'Development invitation link',
    'conversations.listEyebrow': 'Conversations',
    'conversations.listTitle': 'Your active threads',
    'conversations.refresh': 'Refresh',
    'conversations.loading': 'Loading conversations...',
    'conversations.emptyTitle': 'No conversations yet',
    'conversations.emptyBody':
      'Start by inviting someone into a mediated thread. Once they accept, the first response can begin.',
    'conversations.youInvited': 'You invited',
    'conversations.youWereInvited': 'You were invited',
    'conversations.updated': 'Updated',
    'conversations.loadError': 'Could not load conversations.',
    'conversations.createError': 'Could not create the conversation.',
    'conversation.back': 'Back to conversations',
    'conversation.loading': 'Loading conversation...',
    'conversation.loadError': 'Could not load the conversation.',
    'conversation.withLabel': 'Conversation with',
    'conversation.issueLabel': 'Issue description',
    'conversation.stateLabel': 'Current state',
    'conversation.replyLabel': 'Reply',
    'conversation.replyPlaceholder': 'Write what you want Olive to convey.',
    'conversation.replyHelp':
      'Messages are visible only in your private thread. Olive will translate the intent for the other person.',
    'conversation.noCreditsPlaceholder': 'You have no credits left for new replies.',
    'conversation.noCreditsHint':
      'You have used all available credits. Choose a top-up package below to continue.',
    'conversation.noCreditsTitle': 'You are out of credits',
    'conversation.noCreditsBody': 'You cannot send more replies until your credits are topped up.',
    'conversation.topUpCurrentCurrency': 'Charged in',
    'conversation.topUpCreditsUnit': 'credits',
    'conversation.topUpContinue': 'Proceed to payment',
    'conversation.topUpOpening': 'Opening Stripe Checkout...',
    'conversation.topUpConfirming': 'Confirming your payment...',
    'conversation.topUpSuccess': 'Your credits were added successfully.',
    'conversation.topUpCanceled': 'Checkout was canceled before payment was completed.',
    'conversation.topUpUnavailable':
      'Credit top-up is temporarily unavailable. Please try again later.',
    'conversation.noCreditsClose': 'Close',
    'conversation.sendReply': 'Send reply',
    'conversation.sendingReply': 'Sending...',
    'conversation.sendError': 'Your message could not be sent. Please try again.',
    'conversation.privateThreadEyebrow': 'Private thread',
    'conversation.privateThreadTitle': 'Olive and you',
    'conversation.emptyThread':
      'No messages yet. Once the other participant enters the conversation, Olive will begin relaying replies here.',
    'conversation.you': 'You',
    'conversation.mediator': 'Olive',
    'conversation.inviterThread': 'Inviter thread',
    'conversation.inviteeThread': 'Invitee thread',
    'turn.pending-acceptance': 'Invitation sent. Waiting for the other person to accept.',
    'turn.your-turn': 'Your turn to reply.',
    'turn.waiting': 'Waiting for the other person to reply.',
    'turn.mediating': 'Olive is preparing the next reply.',
    'turn.failed': 'Olive is temporarily unavailable. Please try again later.',
    'turn.expired': 'This invitation expired before the conversation started.',
    'turn.closed': 'This conversation is closed.',
    'goal.solve-a-disagreement': 'Solve a disagreement',
    'goal.work-out-a-relationship-issue': 'Work out a relationship issue',
    'goal.get-to-know-each-other-better': 'Get to know each other better',
    'goal.rebuild-trust-after-a-hurt': 'Rebuild trust after a hurt',
    'goal.set-healthier-boundaries': 'Set healthier boundaries',
    'goal.make-a-shared-decision': 'Make a shared decision'
  },
  sv: {
    'app.brand': 'oliveaccord',
    'app.tagline': 'Privata AI-medlade samtal',
    'app.subtitle':
      'Privata tr\u00e5dar, lugnare formuleringar och strukturerad f\u00f6rst\u00e5else genom sv\u00e5ra samtal.',
    'app.signedInAs': 'Inloggad som',
    'app.creditsBalance': 'Krediter:',
    'app.logout': 'Logga ut',
    'login.eyebrow': 'Privat medling',
    'login.heroTitle': 'Ett lugnare s\u00e4tt att ta sig igenom ett sv\u00e5rt samtal.',
    'login.heroBody':
      'Varje person f\u00e5r en privat tr\u00e5d med Olive. Du kan skriva \u00e4rligt, Olive omformulerar budskapet, och den andra personen ser bara den tydligare versionen.',
    'login.featureOtpTitle': 'OTP-inloggning',
    'login.featureOtpBody': 'Anv\u00e4nd en eng\u00e5ngskod som skickas till din e-post.',
    'login.featureThreadsTitle': 'Privata tr\u00e5dar',
    'login.featureThreadsBody': 'Varje deltagare ser bara sin egen tr\u00e5d.',
    'login.featureGoalsTitle': 'Tydliga m\u00e5l',
    'login.featureGoalsBody': 'B\u00f6rja med ett problem och en tydlig avsikt.',
    'login.howItWorksEyebrow': 'S\u00e5 fungerar det',
    'login.howItWorksTitle':
      'oliveaccord h\u00e5ller samtalet privat, strukturerat och l\u00e4ttare att hantera.',
    'login.howItWorksBody':
      'Det finns inget gemensamt chattrum. Olive medlar mellan tv\u00e5 privata tr\u00e5dar och f\u00f6r samtalet fram\u00e5t steg f\u00f6r steg.',
    'login.howStep1Title': 'B\u00f6rja med problemet',
    'login.howStep1Body':
      'Logga in, bjud in den andra personen och beskriv vad som \u00e4r sv\u00e5rt och vad du hoppas ska bli b\u00e4ttre.',
    'login.howStep2Title': 'Skriv privat till Olive',
    'login.howStep2Body':
      'Varje deltagare skriver bara i sin egen privata tr\u00e5d, s\u00e5 att r\u00e5a formuleringar aldrig visas direkt f\u00f6r den andra personen.',
    'login.howStep3Title': 'F\u00e5 ett lugnare svar',
    'login.howStep3Body':
      'Olive f\u00f6rmedlar avsikten i tydligare och mer konstruktivt spr\u00e5k s\u00e5 att ni kan ta n\u00e4sta steg.',
    'login.privacyPill': 'Privata tr\u00e5dar',
    'login.rawMessagesPill': 'Inga r\u00e5a originalmeddelanden',
    'login.guidedPill': 'Olive leder utbytet',
    'login.signInEyebrow': 'Logga in',
    'login.headingRequest': 'H\u00e4mta din eng\u00e5ngskod',
    'login.headingVerify': 'Slutf\u00f6r din registrering',
    'login.bodyRequest': 'Vi skickar en eng\u00e5ngskod till din e-postadress.',
    'login.bodyVerify': 'Ange koden och skriv ditt namn f\u00f6r att slutf\u00f6ra registreringen.',
    'login.emailLabel': 'E-postadress',
    'login.emailPlaceholder': 'du@example.com',
    'login.nameLabel': 'Ditt namn',
    'login.namePlaceholder': 'Ange ditt namn',
    'login.codeLabel': 'Eng\u00e5ngskod',
    'login.languageLabel': 'Spr\u00e5k',
    'login.countryLabel': 'Land',
    'login.sendCode': 'Skicka kod',
    'login.verifyCode': 'Verifiera kod',
    'login.useAnotherEmail': 'Anv\u00e4nd annan e-post',
    'login.sendCodeError': 'Det gick inte att skicka eng\u00e5ngskoden.',
    'login.verifyCodeError': 'Det gick inte att verifiera eng\u00e5ngskoden.',
    'accept.eyebrow': 'Inbjudan',
    'accept.loadingTitle': 'Accepterar inbjudan',
    'accept.loadingBody':
      'Vi loggar in dig automatiskt och \u00f6ppnar den privata samtalstr\u00e5den.',
    'accept.errorTitle': 'Det gick inte att \u00f6ppna inbjudan',
    'accept.errorFallback': 'Inbjudan har g\u00e5tt ut eller \u00e4r inte l\u00e4ngre giltig.',
    'accept.goToSignIn': 'G\u00e5 till inloggning',
    'notification.eyebrow': 'S\u00e4ker l\u00e4nk',
    'notification.loadingTitle': '\u00d6ppnar samtalet',
    'notification.loadingBody':
      'Vi loggar in dig automatiskt och \u00f6ppnar den senaste privata samtalstr\u00e5den.',
    'notification.errorTitle': 'Det gick inte att \u00f6ppna samtalet',
    'notification.errorFallback': 'Den h\u00e4r s\u00e4kra l\u00e4nken har g\u00e5tt ut eller \u00e4r inte l\u00e4ngre giltig.',
    'notification.goToSignIn': 'G\u00e5 till inloggning',
    'profile.eyebrow': 'Slutf\u00f6r profil',
    'profile.title': 'Innan du b\u00f6rjar chatta',
    'profile.body':
      'L\u00e4gg till ditt namn s\u00e5 att Olive kan tilltala dig korrekt. Spr\u00e5kinst\u00e4llningar fr\u00e5n webbl\u00e4saren anv\u00e4nds automatiskt.',
    'profile.nameLabel': 'Namn',
    'profile.namePlaceholder': 'Ange namnet du vill anv\u00e4nda',
    'profile.save': 'Forts\u00e4tt',
    'profile.saveError': 'Det gick inte att spara profilen.',
    'personality.eyebrow': 'Personlighetsprofil',
    'personality.title': 'Hj\u00e4lp Olive att f\u00f6rst\u00e5 dig',
    'personality.body':
      'Svara p\u00e5 n\u00e5gra korta fr\u00e5gor s\u00e5 att framtida svar b\u00e4ttre kan anpassas till din kommunikationsstil och bakgrund.',
    'personality.answerLabel': 'Ditt svar',
    'personality.placeholder': 'Skriv s\u00e5 mycket eller lite du vill.',
    'personality.finish': 'Avsluta nu',
    'personality.saveAndContinue': 'Spara och forts\u00e4tt',
    'personality.saveAndFinish': 'Spara och avsluta',
    'personality.saveError': 'Det gick inte att spara din personlighetsprofil.',
    'conversations.inviteEyebrow': 'Bjud in n\u00e5gon',
    'conversations.inviteTitle': 'Starta ett medlat samtal',
    'conversations.inviteBody':
      'Bjud in en annan person via e-post, beskriv problemet och v\u00e4lj ett m\u00e5l s\u00e5 att Olive f\u00e5r sammanhang innan f\u00f6rsta svaret.',
    'conversations.inviteeEmailLabel': 'Bjud in via e-post',
    'conversations.inviteeEmailPlaceholder': 'annan-person@example.com',
    'conversations.goalLabel': 'Jag vill:',
    'conversations.goalPlaceholder': 'V\u00e4lj ett m\u00e5l',
    'conversations.issueLabel': 'Beskriv problemet',
    'conversations.issuePlaceholder':
      'Beskriv vad som h\u00e4nder, vad som k\u00e4nns sv\u00e5rt och vad du hoppas ska bli b\u00e4ttre.',
    'conversations.sendInvite': 'Skicka inbjudan',
    'conversations.devLinkTitle': 'Utvecklingsl\u00e4nk f\u00f6r inbjudan',
    'conversations.listEyebrow': 'Samtal',
    'conversations.listTitle': 'Dina aktiva tr\u00e5dar',
    'conversations.refresh': 'Uppdatera',
    'conversations.loading': 'Laddar samtal...',
    'conversations.emptyTitle': 'Inga samtal \u00e4n',
    'conversations.emptyBody':
      'B\u00f6rja med att bjuda in n\u00e5gon till en medlad tr\u00e5d. N\u00e4r personen accepterar kan f\u00f6rsta svaret b\u00f6rja.',
    'conversations.youInvited': 'Du bj\u00f6d in',
    'conversations.youWereInvited': 'Du blev inbjuden',
    'conversations.updated': 'Uppdaterad',
    'conversations.loadError': 'Det gick inte att ladda samtalen.',
    'conversations.createError': 'Det gick inte att skapa samtalet.',
    'conversation.back': 'Tillbaka till samtal',
    'conversation.loading': 'Laddar samtal...',
    'conversation.loadError': 'Det gick inte att ladda samtalet.',
    'conversation.withLabel': 'Samtal med',
    'conversation.issueLabel': 'Problembeskrivning',
    'conversation.stateLabel': 'Nuvarande l\u00e4ge',
    'conversation.replyLabel': 'Svara',
    'conversation.replyPlaceholder': 'Skriv det du vill att Olive ska f\u00f6rmedla.',
    'conversation.replyHelp':
      'Meddelanden syns bara i din privata tr\u00e5d. Olive omformulerar inneh\u00e5llet f\u00f6r den andra personen.',
    'conversation.noCreditsPlaceholder': 'Du har inga krediter kvar f\u00f6r nya svar.',
    'conversation.noCreditsHint':
      'Du har anv\u00e4nt alla tillg\u00e4ngliga krediter. V\u00e4lj ett p\u00e5fyllnadspaket nedan f\u00f6r att forts\u00e4tta.',
    'conversation.noCreditsTitle': 'Du har slut p\u00e5 krediter',
    'conversation.noCreditsBody':
      'Du kan inte skicka fler svar f\u00f6rr\u00e4n dina krediter fylls p\u00e5.',
    'conversation.topUpCurrentCurrency': 'Debiteras i',
    'conversation.topUpCreditsUnit': 'krediter',
    'conversation.topUpContinue': 'Fortsätt till betalning',
    'conversation.topUpOpening': '\u00d6ppnar Stripe Checkout...',
    'conversation.topUpConfirming': 'Bekr\u00e4ftar din betalning...',
    'conversation.topUpSuccess': 'Dina krediter har lagts till.',
    'conversation.topUpCanceled': 'Checkout avbr\u00f6ts innan betalningen slutf\u00f6rdes.',
    'conversation.topUpUnavailable':
      'P\u00e5fyllning av krediter \u00e4r tillf\u00e4lligt otillg\u00e4nglig. F\u00f6rs\u00f6k igen senare.',
    'conversation.noCreditsClose': 'St\u00e4ng',
    'conversation.sendReply': 'Skicka svar',
    'conversation.sendingReply': 'Skickar...',
    'conversation.sendError': 'Ditt meddelande kunde inte skickas. F\u00f6rs\u00f6k igen.',
    'conversation.privateThreadEyebrow': 'Privat tr\u00e5d',
    'conversation.privateThreadTitle': 'Olive och du',
    'conversation.emptyThread':
      'Inga meddelanden \u00e4nnu. N\u00e4r den andra deltagaren g\u00e5r in i samtalet b\u00f6rjar Olive f\u00f6rmedla svar h\u00e4r.',
    'conversation.you': 'Du',
    'conversation.mediator': 'Olive',
    'conversation.inviterThread': 'Inbjudarens tr\u00e5d',
    'conversation.inviteeThread': 'Inbjudens tr\u00e5d',
    'turn.pending-acceptance': 'Inbjudan skickad. V\u00e4ntar p\u00e5 att den andra personen ska acceptera.',
    'turn.your-turn': 'Det \u00e4r din tur att svara.',
    'turn.waiting': 'V\u00e4ntar p\u00e5 att den andra personen ska svara.',
    'turn.mediating': 'Olive f\u00f6rbereder n\u00e4sta svar.',
    'turn.failed': 'Olive \u00e4r tillf\u00e4lligt otillg\u00e4nglig. F\u00f6rs\u00f6k igen senare.',
    'turn.expired': 'Den h\u00e4r inbjudan gick ut innan samtalet startade.',
    'turn.closed': 'Det h\u00e4r samtalet \u00e4r st\u00e4ngt.',
    'goal.solve-a-disagreement': 'L\u00f6sa en konflikt',
    'goal.work-out-a-relationship-issue': 'Bearbeta ett relationsproblem',
    'goal.get-to-know-each-other-better': 'L\u00e4ra k\u00e4nna varandra b\u00e4ttre',
    'goal.rebuild-trust-after-a-hurt': '\u00c5terbygga tillit efter en s\u00e5rande h\u00e4ndelse',
    'goal.set-healthier-boundaries': 'S\u00e4tta sundare gr\u00e4nser',
    'goal.make-a-shared-decision': 'Fatta ett gemensamt beslut'
  }
} as const;

type TranslationKey = keyof typeof translations.en;

function formatDisplayName(type: 'language' | 'region', code: string, locale: string): string {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type });
    return displayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function detectBrowserProfile(): BrowserProfile {
  const locale =
    typeof navigator !== 'undefined' && typeof navigator.language === 'string'
      ? navigator.language
      : 'en-US';
  const [languagePart, countryPart] = locale.split(/[-_]/);
  const normalizedLanguage = (languagePart || 'en').toLowerCase();
  const normalizedCountry = countryPart ? countryPart.toUpperCase() : null;
  const uiLanguage: SupportedUiLanguage = normalizedLanguage === 'sv' ? 'sv' : 'en';

  return {
    locale,
    language: normalizedLanguage,
    country: normalizedCountry,
    uiLanguage,
    languageLabel: formatDisplayName('language', normalizedLanguage, locale),
    countryLabel: normalizedCountry ? formatDisplayName('region', normalizedCountry, locale) : null
  };
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  public readonly browserProfile = signal<BrowserProfile>(detectBrowserProfile());
  public readonly language = signal<SupportedUiLanguage>(this.browserProfile().uiLanguage);

  public t(key: TranslationKey): string {
    return translations[this.language()][key] ?? translations.en[key];
  }

  public turnStateLabel(turnState: ConversationTurnState): string {
    const key = `turn.${turnState}` as TranslationKey;
    return this.t(key);
  }

  public goalLabel(goalKey: string, fallback: string): string {
    const key = `goal.${goalKey}` as TranslationKey;
    return translations[this.language()][key] ?? fallback;
  }

  public formatDateTime(
    value: string | number | Date,
    style: 'short' | 'medium' = 'short'
  ): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const options =
      style === 'medium'
        ? ({
            dateStyle: 'medium',
            timeStyle: 'short'
          } satisfies Intl.DateTimeFormatOptions)
        : ({
            dateStyle: 'short',
            timeStyle: 'short'
          } satisfies Intl.DateTimeFormatOptions);

    return new Intl.DateTimeFormat(this.browserProfile().locale, options).format(date);
  }
}
