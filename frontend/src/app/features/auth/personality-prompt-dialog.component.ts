import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

interface PersonalityQuestion {
  id: string;
  question: string;
}

const questionsByLanguage: Record<'en' | 'sv', PersonalityQuestion[]> = {
  en: [
    {
      id: 'communication-style',
      question: 'How do you usually prefer people to communicate with you when a topic is difficult?'
    },
    {
      id: 'response-style',
      question:
        'What kind of responses feel most helpful to you: direct, gentle, detailed, brief, or something else?'
    },
    {
      id: 'feeling-heard',
      question: 'What tends to make you feel understood and respected in a conversation?'
    },
    {
      id: 'sensitive-patterns',
      question:
        'Are there any phrases, tones, or patterns that usually make communication harder for you?'
    },
    {
      id: 'background-context',
      question:
        'What personal background or context would help someone understand where you are coming from?'
    },
    {
      id: 'anything-else',
      question:
        'Is there anything else you would like to share that can help me understand you better?'
    }
  ],
  sv: [
    {
      id: 'communication-style',
      question: 'Hur brukar du helst vilja att andra kommunicerar med dig nar ett amne ar svart?'
    },
    {
      id: 'response-style',
      question:
        'Vilken typ av svar kanns mest hjalpsamma for dig: direkta, varsamma, detaljerade, korta eller nagot annat?'
    },
    {
      id: 'feeling-heard',
      question: 'Vad brukar fa dig att kanna dig forstadd och respekterad i ett samtal?'
    },
    {
      id: 'sensitive-patterns',
      question:
        'Finns det nagra formuleringar, tonlagen eller monster som brukar gora kommunikationen svarare for dig?'
    },
    {
      id: 'background-context',
      question:
        'Vilken personlig bakgrund eller vilket sammanhang skulle hjalpa nagon att forsta var du kommer ifran?'
    },
    {
      id: 'anything-else',
      question: 'Ar det nagot annat du vill dela som kan hjalpa mig att forsta dig battre?'
    }
  ]
};

@Component({
  selector: 'app-personality-prompt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule],
  template: `
    @if (visible()) {
      <p-dialog
        [visible]="true"
        [modal]="true"
        [closable]="false"
        [dismissableMask]="false"
        [draggable]="false"
        [resizable]="false"
        [style]="{ width: '42rem', maxWidth: 'calc(100vw - 2rem)' }"
      >
        <ng-template pTemplate="header">
          <div class="space-y-2">
            <p class="m-0 text-sm uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
              {{ i18n.t('personality.eyebrow') }}
            </p>
            <h2 class="m-0 text-2xl font-semibold text-[color:var(--text-strong)]">
              {{ i18n.t('personality.title') }}
            </h2>
          </div>
        </ng-template>

        <div class="space-y-5">
          <p class="m-0 text-sm leading-6 text-[color:var(--text-muted)]">
            {{ i18n.t('personality.body') }}
          </p>

          @if (errorMessage()) {
            <div class="rounded-2xl border border-[rgba(177,73,74,0.18)] bg-[rgba(177,73,74,0.08)] px-4 py-3 text-sm text-[color:var(--danger-500)]">
              {{ errorMessage() }}
            </div>
          }

          <div class="rounded-[1.5rem] bg-[rgba(248,250,246,0.96)] px-4 py-3">
            <p class="m-0 text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              {{ stepLabel() }}
            </p>
            <p class="mt-3 text-base font-medium leading-7 text-[color:var(--text-strong)]">
              {{ currentQuestion().question }}
            </p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-[color:var(--text-strong)]" for="personalityAnswer">
              {{ i18n.t('personality.answerLabel') }}
            </label>
            <div class="field-shell rounded-[1.5rem] px-4 py-3">
              <textarea
                id="personalityAnswer"
                rows="7"
                class="min-h-40 w-full resize-none border-none bg-transparent p-0 text-sm leading-7 text-[color:var(--text-strong)] outline-none"
                [ngModel]="currentAnswer()"
                (ngModelChange)="updateCurrentAnswer($event)"
                [placeholder]="i18n.t('personality.placeholder')"
              ></textarea>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <p-button
              [label]="i18n.t('personality.finish')"
              severity="secondary"
              [outlined]="true"
              [disabled]="isSaving()"
              styleClass="!w-full sm:!w-auto"
              (onClick)="finish()"
            />
            <p-button
              [label]="isLastQuestion() ? i18n.t('personality.saveAndFinish') : i18n.t('personality.saveAndContinue')"
              [loading]="isSaving()"
              [disabled]="!currentAnswer().trim()"
              styleClass="!w-full sm:!w-auto !bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
              (onClick)="saveAndContinue()"
            />
          </div>
        </div>
      </p-dialog>
    }
  `
})
export class PersonalityPromptDialogComponent {
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly i18n = inject(I18nService);
  protected readonly currentQuestionIndex = signal(0);
  protected readonly responses = signal<Record<string, string>>({});
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly questions = computed(() => questionsByLanguage[this.i18n.language()]);
  protected readonly currentQuestion = computed(
    () => this.questions()[this.currentQuestionIndex()] ?? this.questions()[0]
  );
  protected readonly currentAnswer = computed(
    () => this.responses()[this.currentQuestion().id] ?? ''
  );
  protected readonly isLastQuestion = computed(
    () => this.currentQuestionIndex() >= this.questions().length - 1
  );
  protected readonly visible = computed(() => {
    if (!this.authStore.isAuthenticated()) {
      return false;
    }

    if (this.authStore.requiresProfileCompletion()) {
      return false;
    }

    if (!this.authStore.personalityPromptPending()) {
      return false;
    }

    if (this.authStore.user()?.hasPersonality) {
      return false;
    }

    return (
      !this.router.url.startsWith('/login') &&
      !this.router.url.startsWith('/accept-invitation') &&
      !this.router.url.startsWith('/complete-profile')
    );
  });

  protected updateCurrentAnswer(value: string) {
    this.responses.update((responses) => ({
      ...responses,
      [this.currentQuestion().id]: value
    }));
    this.errorMessage.set(null);
  }

  protected stepLabel() {
    const current = this.currentQuestionIndex() + 1;
    const total = this.questions().length;
    return this.i18n.language() === 'sv' ? `Steg ${current} av ${total}` : `Step ${current} of ${total}`;
  }

  protected async saveAndContinue() {
    if (!this.currentAnswer().trim()) {
      return;
    }

    if (this.isLastQuestion()) {
      await this.finish();
      return;
    }

    this.currentQuestionIndex.update((index) => index + 1);
  }

  protected async finish() {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.api.savePersonality({
          responses: this.questions()
            .slice(0, this.currentQuestionIndex() + 1)
            .map((question) => ({
              questionId: question.id,
              answer: this.responses()[question.id] ?? null
            }))
        })
      );

      this.authStore.updateUser(response.user);
      this.authStore.setPersonalityPromptPending(false);
    } catch (error) {
      this.errorMessage.set(getApiErrorMessage(error, this.i18n.t('personality.saveError')));
    } finally {
      this.isSaving.set(false);
    }
  }
}
