import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputOtpModule, InputTextModule],
  template: `
    <section class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
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

          <p class="mt-8 text-sm uppercase tracking-[0.34em] text-[color:var(--accent-600)]">{{ i18n.t('login.eyebrow') }}</p>
          <p class="mt-4 max-w-2xl text-lg font-medium tracking-[0.08em] text-[color:var(--surface-900)] sm:text-xl">
            {{ i18n.t('app.tagline') }}
          </p>
          <h2 class="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-[color:var(--text-strong)] sm:text-5xl">
            {{ i18n.t('login.heroTitle') }}
          </h2>
          <p class="mt-5 max-w-2xl text-base leading-7 text-[color:var(--text-muted)] sm:text-lg">
            {{ i18n.t('login.heroBody') }}
          </p>

          <div class="mt-10 w-full max-w-3xl rounded-[2rem] border border-[rgba(132,157,112,0.16)] bg-[linear-gradient(155deg,rgba(255,255,255,0.72),rgba(244,248,241,0.48))] p-6 text-left shadow-[0_20px_55px_rgba(61,95,88,0.08)] sm:p-8">
            <div class="mx-auto max-w-2xl text-center">
              <p class="m-0 text-xs uppercase tracking-[0.32em] text-[color:var(--accent-600)]">{{ i18n.t('login.howItWorksEyebrow') }}</p>
              <h3 class="mt-3 text-2xl font-semibold leading-tight text-[color:var(--text-strong)] sm:text-3xl">
                {{ i18n.t('login.howItWorksTitle') }}
              </h3>
              <p class="mt-3 text-sm leading-6 text-[color:var(--text-muted)] sm:text-base">
                {{ i18n.t('login.howItWorksBody') }}
              </p>
            </div>

            <div class="mt-8 grid gap-4 md:grid-cols-3">
              <div class="rounded-[1.6rem] border border-[rgba(75,142,147,0.14)] bg-[linear-gradient(155deg,rgba(74,143,147,0.16),rgba(255,255,255,0.82))] p-5">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(44,105,112,0.14)] text-sm font-semibold text-[color:var(--surface-900)]">1</div>
                <p class="mt-4 text-base font-semibold text-[color:var(--text-strong)]">{{ i18n.t('login.howStep1Title') }}</p>
                <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{{ i18n.t('login.howStep1Body') }}</p>
              </div>
              <div class="rounded-[1.6rem] border border-[rgba(151,167,70,0.16)] bg-[linear-gradient(155deg,rgba(151,167,70,0.15),rgba(255,255,255,0.82))] p-5">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(126,143,52,0.15)] text-sm font-semibold text-[color:var(--accent-600)]">2</div>
                <p class="mt-4 text-base font-semibold text-[color:var(--text-strong)]">{{ i18n.t('login.howStep2Title') }}</p>
                <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{{ i18n.t('login.howStep2Body') }}</p>
              </div>
              <div class="rounded-[1.6rem] border border-[rgba(220,197,129,0.22)] bg-[linear-gradient(155deg,rgba(244,233,188,0.62),rgba(255,255,255,0.84))] p-5">
                <div class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(208,186,116,0.18)] text-sm font-semibold text-[color:var(--accent-600)]">3</div>
                <p class="mt-4 text-base font-semibold text-[color:var(--text-strong)]">{{ i18n.t('login.howStep3Title') }}</p>
                <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{{ i18n.t('login.howStep3Body') }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[color:var(--text-muted)]">
            <span class="rounded-full border border-[rgba(75,142,147,0.14)] bg-[rgba(255,255,255,0.56)] px-4 py-2">{{ i18n.t('login.privacyPill') }}</span>
            <span class="rounded-full border border-[rgba(151,167,70,0.16)] bg-[rgba(255,255,255,0.56)] px-4 py-2">{{ i18n.t('login.rawMessagesPill') }}</span>
            <span class="rounded-full border border-[rgba(220,197,129,0.18)] bg-[rgba(255,255,255,0.56)] px-4 py-2">{{ i18n.t('login.guidedPill') }}</span>
          </div>
        </div>
      </div>

      <div class="lg:sticky lg:top-6">
        <p-card>
          <ng-template pTemplate="header">
            <div class="px-6 pt-6">
              <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('login.signInEyebrow') }}</p>
              <h3 class="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">
                {{ otpRequested() ? i18n.t('login.headingVerify') : i18n.t('login.headingRequest') }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                {{ otpRequested() ? i18n.t('login.bodyVerify') : i18n.t('login.bodyRequest') }}
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
              <label class="text-sm font-medium text-[color:var(--text-strong)]" for="email">{{ i18n.t('login.emailLabel') }}</label>
              <div class="field-shell rounded-2xl px-4 py-3">
                <input
                  id="email"
                  pInputText
                  type="email"
                  class="!border-none !bg-transparent !px-0 !py-0 shadow-none outline-none"
                  [disabled]="otpRequested() || isSubmitting()"
                  [(ngModel)]="email"
                  [placeholder]="i18n.t('login.emailPlaceholder')"
                >
              </div>
            </div>

            @if (otpRequested()) {
              <div class="space-y-2">
                <label class="text-sm font-medium text-[color:var(--text-strong)]" for="name">{{ i18n.t('login.nameLabel') }}</label>
                <div class="field-shell rounded-2xl px-4 py-3">
                  <input
                    id="name"
                    pInputText
                    class="!border-none !bg-transparent !px-0 !py-0 shadow-none outline-none"
                    [(ngModel)]="name"
                    [placeholder]="i18n.t('login.namePlaceholder')"
                  >
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-[color:var(--text-strong)]">{{ i18n.t('login.codeLabel') }}</label>
                <div class="rounded-[1.5rem] border border-[rgba(36,65,72,0.08)] bg-[rgba(248,250,246,0.94)] p-4">
                  <p-inputotp [(ngModel)]="otpCode" [integerOnly]="true" [length]="6" />
                </div>
              </div>

            }

            <div class="flex flex-col gap-3 sm:flex-row">
              @if (!otpRequested()) {
                <p-button
                  [label]="i18n.t('login.sendCode')"
                  [loading]="isSubmitting()"
                  [disabled]="!email().trim()"
                  styleClass="!w-full sm:!w-auto !bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
                  (onClick)="submitEmail()"
                />
              } @else {
                <p-button
                  [label]="i18n.t('login.verifyCode')"
                  [loading]="isSubmitting()"
                  [disabled]="otpCode().length !== 6 || !name().trim()"
                  styleClass="!w-full sm:!w-auto !bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
                  (onClick)="submitOtp()"
                />
                <p-button
                  [label]="i18n.t('login.useAnotherEmail')"
                  severity="secondary"
                  [outlined]="true"
                  [disabled]="isSubmitting()"
                  styleClass="!w-full sm:!w-auto"
                  (onClick)="reset()"
                />
              }
            </div>
          </div>
        </p-card>
      </div>
    </section>
  `
})
export class LoginPageComponent {
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly i18n = inject(I18nService);
  protected readonly browserProfile = this.i18n.browserProfile();
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
      await firstValueFrom(this.api.requestOtp(this.email()));
      this.otpRequested.set(true);
    } catch (error) {
      this.errorMessage.set(getApiErrorMessage(error, this.i18n.t('login.sendCodeError')));
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
      this.errorMessage.set(getApiErrorMessage(error, this.i18n.t('login.verifyCodeError')));
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
