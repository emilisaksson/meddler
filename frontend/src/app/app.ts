import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from './core/services/auth-store.service';
import { I18nService } from './core/services/i18n.service';
import { PersonalityPromptDialogComponent } from './features/auth/personality-prompt-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ButtonModule, PersonalityPromptDialogComponent],
  template: `
    <div class="min-h-screen">
      <div class="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header class="glass-panel relative mb-6 overflow-hidden rounded-[2rem] px-5 py-4">
          <div class="pointer-events-none absolute -right-12 -top-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(233,220,162,0.5),transparent_68%)] blur-2xl"></div>
          <div class="pointer-events-none absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(77,144,147,0.24),transparent_70%)] blur-2xl"></div>

          <div class="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a routerLink="/conversations" class="flex flex-col items-start gap-3 text-inherit no-underline sm:flex-row sm:items-center">
              <div class="logo-shell rounded-[1.7rem] p-2.5">
                <img
                  src="/logo.png"
                  alt="oliveaccord"
                  class="brand-logo h-14 w-auto sm:h-16"
                >
              </div>
              <div class="max-w-sm">
                <p class="m-0 text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('app.tagline') }}</p>
                <p class="mt-2 m-0 text-sm leading-6 text-[color:var(--text-muted)]">
                  {{ i18n.t('app.subtitle') }}
                </p>
              </div>
            </a>

            @if (authStore.user(); as user) {
              <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div class="rounded-full border border-[rgba(150,166,74,0.18)] bg-[rgba(150,166,74,0.12)] px-4 py-2 text-sm text-[color:var(--text-strong)]">
                  {{ i18n.t('app.creditsBalance') }}
                  <span class="font-semibold">{{ formatCredits(user.credits) }}</span>
                </div>
                <div class="rounded-full border border-[rgba(71,138,145,0.16)] bg-[rgba(71,138,145,0.08)] px-4 py-2 text-sm text-[color:var(--text-muted)]">
                  {{ i18n.t('app.signedInAs') }}
                  <span class="font-semibold text-[color:var(--text-strong)]">{{ user.name || user.email }}</span>
                </div>
                <p-button
                  [label]="i18n.t('app.logout')"
                  severity="secondary"
                  [outlined]="true"
                  styleClass="!border-[rgba(71,138,145,0.22)] !text-[color:var(--text-strong)]"
                  (onClick)="logout()"
                />
              </div>
            }
          </div>
        </header>

        <main class="flex-1">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-personality-prompt-dialog />
  `
})
export class App {
  protected readonly authStore = inject(AuthStore);
  protected readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  protected async logout() {
    this.authStore.logout();
    await this.router.navigate(['/login']);
  }

  protected formatCredits(value: number) {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
