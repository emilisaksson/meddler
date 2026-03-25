import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

type SupportedUiLanguage = 'en' | 'sv';

interface LandingStep {
  title: string;
  body: string;
}

interface LandingCard {
  title: string;
  body: string;
}

interface LandingLink {
  href: string;
  label: string;
  description: string;
}

interface LandingFaq {
  question: string;
  answer: string;
}

interface LandingContent {
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  proofPills: string[];
  howEyebrow: string;
  howTitle: string;
  howBody: string;
  steps: LandingStep[];
  tryEyebrow: string;
  requestTitle: string;
  requestBody: string;
  verifyTitle: string;
  verifyBody: string;
  emailLabel: string;
  emailPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  codeLabel: string;
  sendCodeLabel: string;
  verifyCodeLabel: string;
  anotherEmailLabel: string;
  ctaPoints: string[];
  helperNote: string;
  benefitsEyebrow: string;
  benefitsTitle: string;
  benefits: LandingCard[];
  exploreEyebrow: string;
  exploreTitle: string;
  exploreLinks: LandingLink[];
  faqEyebrow: string;
  faqTitle: string;
  faq: LandingFaq[];
  sendCodeError: string;
  verifyCodeError: string;
}

const landingContentByLanguage: Record<SupportedUiLanguage, LandingContent> = {
  en: {
    eyebrow: 'Private AI mediator',
    heroTitle: 'Turn a difficult conversation into calmer, clearer progress.',
    heroBody:
      'oliveaccord gives each person a private thread with Olive. You can be honest in private, Olive reframes the message, and the other person only sees the calmer version.',
    proofPills: [
      'Private threads',
      'No exposed raw messages',
      'Guided one-turn-at-a-time flow'
    ],
    howEyebrow: 'How it works',
    howTitle: 'A more structured way to handle conversations that easily escalate.',
    howBody:
      'There is no shared chat room. Olive mediates between two private threads so each step can be clearer, steadier, and easier to respond to.',
    steps: [
      {
        title: 'Start with the issue',
        body:
          'Describe what feels difficult, what you hope changes, and invite the other person into a private mediated thread.'
      },
      {
        title: 'Write privately to Olive',
        body:
          'Each participant writes only in their own thread, so emotional first drafts do not land directly on the other person.'
      },
      {
        title: 'Let Olive relay the intent',
        body:
          'Olive carries the meaning forward in calmer language so the conversation can keep moving instead of stalling or spiraling.'
      }
    ],
    tryEyebrow: 'Try it yourself',
    requestTitle: 'Get your private access code',
    requestBody:
      'Enter your email and we will send a one-time code so you can start exploring the product immediately.',
    verifyTitle: 'Finish setting up your account',
    verifyBody:
      'Add your name and the one-time code to open your private oliveaccord workspace.',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    nameLabel: 'Your name',
    namePlaceholder: 'Enter your name',
    codeLabel: 'One-time code',
    sendCodeLabel: 'Send my access code',
    verifyCodeLabel: 'Continue',
    anotherEmailLabel: 'Use another email',
    ctaPoints: [
      'No password to remember',
      'Start with a single secure email code'
    ],
    helperNote:
      'Once you are in, you can invite someone and start a private mediated conversation with Olive.',
    benefitsEyebrow: 'Why oliveaccord',
    benefitsTitle: 'Built for people who want honesty without turning every message into another trigger.',
    benefits: [
      {
        title: 'Protect raw wording',
        body:
          'You can say what you mean in private first. Olive helps prevent the sharpest phrasing from becoming the next escalation point.'
      },
      {
        title: 'Add structure to hard moments',
        body:
          'The turn-based flow creates more clarity when both people usually talk past each other or send too much at once.'
      },
      {
        title: 'Stay focused on progress',
        body:
          'oliveaccord is useful when the goal is repair, understanding, healthier boundaries, or a shared decision.'
      }
    ],
    exploreEyebrow: 'Explore more',
    exploreTitle: 'Read more about how oliveaccord works and why people use it.',
    exploreLinks: [
      {
        href: '/how-it-works',
        label: 'How it works',
        description: 'See the private-thread mediation flow step by step.'
      },
      {
        href: '/benefits',
        label: 'Benefits',
        description: 'Understand the main reasons people choose a calmer relay layer.'
      },
      {
        href: '/who-its-for',
        label: "Who it's for",
        description: 'Read which kinds of difficult conversations fit the tool best.'
      }
    ],
    faqEyebrow: 'Questions',
    faqTitle: 'Common questions before you try it',
    faq: [
      {
        question: 'Does the other person see my raw message?',
        answer:
          'No. oliveaccord is designed so each participant writes privately to Olive and Olive relays the intent in a calmer form.'
      },
      {
        question: 'Is this only for couples?',
        answer:
          'No. It can also help with family tension, friendships, housemate conflict, and other sensitive one-to-one conversations.'
      },
      {
        question: 'Why make the front page a sign-up flow?',
        answer:
          'Because the fastest way to understand the product is to experience the private-thread workflow directly instead of only reading about it.'
      }
    ],
    sendCodeError: 'Could not send the one-time code.',
    verifyCodeError: 'Could not verify the one-time code.'
  },
  sv: {
    eyebrow: 'Privat AI-medlare',
    heroTitle: 'Förvandla ett svårt samtal till lugnare och tydligare framsteg.',
    heroBody:
      'oliveaccord ger varje person en privat tråd med Olive. Du kan vara ärlig i privat läge, Olive omformulerar budskapet, och den andra personen ser bara den lugnare versionen.',
    proofPills: [
      'Privata trådar',
      'Inga råa originalmeddelanden',
      'Guidat flöde ett steg i taget'
    ],
    howEyebrow: 'Så fungerar det',
    howTitle: 'Ett mer strukturerat sätt att hantera samtal som lätt eskalerar.',
    howBody:
      'Det finns inget gemensamt chattrum. Olive medlar mellan två privata trådar så att varje steg blir tydligare, lugnare och lättare att svara på.',
    steps: [
      {
        title: 'Börja med problemet',
        body:
          'Beskriv vad som känns svårt, vad du hoppas förändras och bjud in den andra personen till en privat medlad tråd.'
      },
      {
        title: 'Skriv privat till Olive',
        body:
          'Varje deltagare skriver bara i sin egen tråd, så att känslomässiga första utkast inte landar direkt hos den andra personen.'
      },
      {
        title: 'Låt Olive föra avsikten vidare',
        body:
          'Olive förmedlar innebörden i lugnare språk så att samtalet kan gå vidare i stället för att fastna eller spåra ur.'
      }
    ],
    tryEyebrow: 'Prova själv',
    requestTitle: 'Hämta din privata engångskod',
    requestBody:
      'Ange din e-postadress så skickar vi en engångskod så att du kan börja utforska produkten direkt.',
    verifyTitle: 'Slutför din registrering',
    verifyBody:
      'Lägg till ditt namn och engångskoden för att öppna din privata oliveaccord-yta.',
    emailLabel: 'E-postadress',
    emailPlaceholder: 'du@example.com',
    nameLabel: 'Ditt namn',
    namePlaceholder: 'Ange ditt namn',
    codeLabel: 'Engångskod',
    sendCodeLabel: 'Skicka min engångskod',
    verifyCodeLabel: 'Fortsätt',
    anotherEmailLabel: 'Använd annan e-post',
    ctaPoints: [
      'Inget lösenord att komma ihåg',
      'Börja med en säker kod via e-post'
    ],
    helperNote:
      'När du är inne kan du bjuda in någon och starta ett privat medlat samtal med Olive.',
    benefitsEyebrow: 'Varför oliveaccord',
    benefitsTitle: 'Byggt för människor som vill ha ärlighet utan att varje meddelande blir ännu en tändpunkt.',
    benefits: [
      {
        title: 'Undvik rå formulering',
        body:
          'Du kan säga vad du menar i privat läge först. Olive hjälper till att hindra den skarpaste formuleringen från att bli nästa eskalering.'
      },
      {
        title: 'Lägg struktur på svåra stunder',
        body:
          'Flödet ett steg i taget skapar mer tydlighet när båda annars brukar prata förbi varandra eller skicka för mycket på en gång.'
      },
      {
        title: 'Håll fokus på framsteg',
        body:
          'oliveaccord är användbart när målet är reparation, förståelse, sundare gränser eller ett gemensamt beslut.'
      }
    ],
    exploreEyebrow: 'Läs vidare',
    exploreTitle: 'Läs mer om hur oliveaccord fungerar och varför människor använder det.',
    exploreLinks: [
      {
        href: '/how-it-works',
        label: 'Så fungerar det',
        description: 'Se medlingsflödet med privata trådar steg för steg.'
      },
      {
        href: '/benefits',
        label: 'Fördelar',
        description: 'Förstå de viktigaste skälen till att välja ett lugnare mellanlager.'
      },
      {
        href: '/who-its-for',
        label: 'Vem det är för',
        description: 'Läs vilka typer av svåra samtal som passar verktyget bäst.'
      }
    ],
    faqEyebrow: 'Frågor',
    faqTitle: 'Vanliga frågor innan du provar',
    faq: [
      {
        question: 'Ser den andra personen mitt råa meddelande?',
        answer:
          'Nej. oliveaccord är byggt så att varje deltagare skriver privat till Olive och att Olive förmedlar avsikten i lugnare form.'
      },
      {
        question: 'Är detta bara för par?',
        answer:
          'Nej. Det kan också hjälpa vid familjespänningar, vänskaper, konflikter mellan boende och andra känsliga en-till-en-samtal.'
      },
      {
        question: 'Varför lägga registreringen på startsidan?',
        answer:
          'För att det snabbaste sättet att förstå produkten är att uppleva det privata trådflödet direkt i stället för att bara läsa om det.'
      }
    ],
    sendCodeError: 'Det gick inte att skicka engångskoden.',
    verifyCodeError: 'Det gick inte att verifiera engångskoden.'
  }
};

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputOtpModule,
    InputTextModule
  ],
  template: `
    <section class="space-y-6">
      <section class="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <div class="glass-panel relative overflow-hidden rounded-[2.25rem] p-8 sm:p-10 lg:p-12">
          <div class="pointer-events-none absolute -right-12 top-4 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(151,167,70,0.24),transparent_70%)] blur-2xl"></div>
          <div class="pointer-events-none absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(73,145,150,0.2),transparent_72%)] blur-2xl"></div>
          <div class="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,241,196,0.34),transparent_70%)] blur-3xl"></div>

          <div class="relative mx-auto flex max-w-4xl flex-col items-center text-center">
            <div class="logo-shell inline-flex rounded-[2.4rem] p-4 sm:p-5">
              <img
                src="/logo.png"
                alt="oliveaccord"
                class="brand-logo h-36 w-auto sm:h-44 lg:h-52"
              >
            </div>

            <p class="mt-8 text-sm uppercase tracking-[0.34em] text-[color:var(--accent-600)]">{{ copy().eyebrow }}</p>
            <p class="mt-4 max-w-2xl text-lg font-medium tracking-[0.08em] text-[color:var(--surface-900)] sm:text-xl">
              {{ i18n.t('app.tagline') }}
            </p>
            <h1 class="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-[color:var(--text-strong)] sm:text-5xl">
              {{ copy().heroTitle }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-[color:var(--text-muted)] sm:text-lg">
              {{ copy().heroBody }}
            </p>

            <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[color:var(--text-muted)]">
              @for (pill of copy().proofPills; track pill) {
                <span class="rounded-full border border-[rgba(75,142,147,0.14)] bg-[rgba(255,255,255,0.56)] px-4 py-2">{{ pill }}</span>
              }
            </div>

            <div class="mt-10 w-full max-w-3xl rounded-[2rem] border border-[rgba(132,157,112,0.16)] bg-[linear-gradient(155deg,rgba(255,255,255,0.72),rgba(244,248,241,0.48))] p-6 text-left shadow-[0_20px_55px_rgba(61,95,88,0.08)] sm:p-8">
              <div class="mx-auto max-w-2xl text-center">
                <p class="m-0 text-xs uppercase tracking-[0.32em] text-[color:var(--accent-600)]">{{ copy().howEyebrow }}</p>
                <h2 class="mt-3 text-2xl font-semibold leading-tight text-[color:var(--text-strong)] sm:text-3xl">
                  {{ copy().howTitle }}
                </h2>
                <p class="mt-3 text-sm leading-6 text-[color:var(--text-muted)] sm:text-base">
                  {{ copy().howBody }}
                </p>
              </div>

              <div class="mt-8 grid gap-4 md:grid-cols-3">
                @for (step of copy().steps; track step.title; let index = $index) {
                  <div class="rounded-[1.6rem] border border-[rgba(75,142,147,0.14)] bg-[linear-gradient(155deg,rgba(255,255,255,0.84),rgba(246,250,243,0.72))] p-5">
                    <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(44,105,112,0.14)] text-sm font-semibold text-[color:var(--surface-900)]">
                      {{ index + 1 }}
                    </div>
                    <p class="mt-4 text-base font-semibold text-[color:var(--text-strong)]">{{ step.title }}</p>
                    <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{{ step.body }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="lg:sticky lg:top-6">
          <p-card>
            <ng-template pTemplate="header">
              <div class="px-6 pt-6">
                <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--accent-600)]">{{ copy().tryEyebrow }}</p>
                <h2 class="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                  {{ otpRequested() ? copy().verifyTitle : copy().requestTitle }}
                </h2>
                <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                  {{ otpRequested() ? copy().verifyBody : copy().requestBody }}
                </p>
              </div>
            </ng-template>

            <div class="space-y-5">
              @if (errorMessage()) {
                <div class="rounded-2xl border border-[rgba(177,73,74,0.18)] bg-[rgba(177,73,74,0.08)] px-4 py-3 text-sm text-[color:var(--danger-500)]">
                  {{ errorMessage() }}
                </div>
              }

              <div class="space-y-2">
                <label class="text-sm font-medium text-[color:var(--text-strong)]" for="email">{{ copy().emailLabel }}</label>
                <div class="field-shell rounded-2xl px-4 py-3">
                  <input
                    id="email"
                    pInputText
                    type="email"
                    class="!border-none !bg-transparent !px-0 !py-0 shadow-none outline-none"
                    [disabled]="otpRequested() || isSubmitting()"
                    [(ngModel)]="email"
                    [placeholder]="copy().emailPlaceholder"
                  >
                </div>
              </div>

              @if (otpRequested()) {
                <div class="space-y-2">
                  <label class="text-sm font-medium text-[color:var(--text-strong)]" for="name">{{ copy().nameLabel }}</label>
                  <div class="field-shell rounded-2xl px-4 py-3">
                    <input
                      id="name"
                      pInputText
                      class="!border-none !bg-transparent !px-0 !py-0 shadow-none outline-none"
                      [(ngModel)]="name"
                      [placeholder]="copy().namePlaceholder"
                    >
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-[color:var(--text-strong)]">{{ copy().codeLabel }}</label>
                  <div class="rounded-[1.5rem] border border-[rgba(36,65,72,0.08)] bg-[rgba(248,250,246,0.94)] p-4">
                    <p-inputotp [(ngModel)]="otpCode" [integerOnly]="true" [length]="6" />
                  </div>
                </div>
              }

              <div class="flex flex-col gap-3 sm:flex-row">
                @if (!otpRequested()) {
                  <p-button
                    [label]="copy().sendCodeLabel"
                    [loading]="isSubmitting()"
                    [disabled]="!email().trim()"
                    styleClass="!w-full sm:!w-auto !bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
                    (onClick)="submitEmail()"
                  />
                } @else {
                  <p-button
                    [label]="copy().verifyCodeLabel"
                    [loading]="isSubmitting()"
                    [disabled]="otpCode().length !== 6 || !name().trim()"
                    styleClass="!w-full sm:!w-auto !bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
                    (onClick)="submitOtp()"
                  />
                  <p-button
                    [label]="copy().anotherEmailLabel"
                    severity="secondary"
                    [outlined]="true"
                    [disabled]="isSubmitting()"
                    styleClass="!w-full sm:!w-auto"
                    (onClick)="reset()"
                  />
                }
              </div>

              <div class="rounded-[1.6rem] border border-[rgba(75,142,147,0.14)] bg-[linear-gradient(155deg,rgba(255,255,255,0.84),rgba(244,248,241,0.62))] p-5">
                <div class="space-y-3">
                  @for (point of copy().ctaPoints; track point) {
                    <div class="rounded-[1.1rem] bg-white/70 px-4 py-3 text-sm leading-6 text-[color:var(--text-strong)]">
                      {{ point }}
                    </div>
                  }
                </div>
                <p class="mt-4 text-xs leading-6 text-[color:var(--text-muted)]">{{ copy().helperNote }}</p>
              </div>
            </div>
          </p-card>
        </div>
      </section>

      <section class="space-y-4">
        <div class="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p class="m-0 text-sm uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{{ copy().benefitsEyebrow }}</p>
          <h2 class="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">{{ copy().benefitsTitle }}</h2>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          @for (benefit of copy().benefits; track benefit.title) {
            <article class="glass-panel rounded-[2rem] p-6">
              <h3 class="m-0 text-2xl font-semibold text-[color:var(--text-strong)]">{{ benefit.title }}</h3>
              <p class="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{{ benefit.body }}</p>
            </article>
          }
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div class="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p class="m-0 text-sm uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{{ copy().exploreEyebrow }}</p>
          <h2 class="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">{{ copy().exploreTitle }}</h2>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            @for (link of copy().exploreLinks; track link.href) {
              <a
                [routerLink]="link.href"
                class="block rounded-[1.6rem] border border-[rgba(75,142,147,0.14)] bg-white/72 px-5 py-4 text-inherit no-underline transition-transform duration-200 hover:-translate-y-0.5"
              >
                <h3 class="m-0 text-lg font-semibold text-[color:var(--text-strong)]">{{ link.label }}</h3>
                <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{{ link.description }}</p>
              </a>
            }
          </div>
        </div>

        <div class="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p class="m-0 text-sm uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{{ copy().faqEyebrow }}</p>
          <h2 class="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">{{ copy().faqTitle }}</h2>

          <div class="mt-6 space-y-4">
            @for (item of copy().faq; track item.question) {
              <article class="rounded-[1.6rem] border border-[rgba(132,157,112,0.14)] bg-white/72 px-5 py-4">
                <h3 class="m-0 text-lg font-semibold text-[color:var(--text-strong)]">{{ item.question }}</h3>
                <p class="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{{ item.answer }}</p>
              </article>
            }
          </div>
        </div>
      </section>
    </section>
  `
})
export class LoginPageComponent {
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly i18n = inject(I18nService);
  protected readonly browserProfile = this.i18n.browserProfile();
  protected readonly copy = computed(() => landingContentByLanguage[this.i18n.language()]);
  protected readonly email = signal('');
  protected readonly name = signal('');
  protected readonly otpCode = signal('');
  protected readonly otpRequested = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async submitEmail() {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      await firstValueFrom(
        this.api.requestOtp(
          this.email(),
          this.browserProfile.language,
          this.browserProfile.country
        )
      );
      this.otpRequested.set(true);
    } catch (error) {
      this.errorMessage.set(getApiErrorMessage(error, this.copy().sendCodeError));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected async submitOtp() {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.api.verifyOtp({
          email: this.email(),
          code: this.otpCode(),
          name: this.name(),
          language: this.browserProfile.language,
          country: this.browserProfile.country
        })
      );

      this.authStore.startSession(response);

      if (response.user.requiresProfileCompletion) {
        await this.router.navigate(['/complete-profile']);
      } else {
        await this.router.navigate(['/conversations']);
      }
    } catch (error) {
      this.errorMessage.set(getApiErrorMessage(error, this.copy().verifyCodeError));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected reset() {
    this.otpRequested.set(false);
    this.name.set('');
    this.otpCode.set('');
    this.errorMessage.set(null);
  }
}
