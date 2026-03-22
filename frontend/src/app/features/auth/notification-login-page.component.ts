import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-notification-login-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, ProgressSpinnerModule],
  template: `
    <div class="mx-auto max-w-2xl">
      <p-card>
        <div class="flex flex-col items-center gap-6 py-4 text-center">
          @if (isLoading()) {
            <p-progressSpinner strokeWidth="4" />
            <div>
              <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('notification.eyebrow') }}</p>
              <h2 class="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('notification.loadingTitle') }}</h2>
              <p class="mt-3 max-w-lg text-sm leading-6 text-[color:var(--text-muted)]">
                {{ i18n.t('notification.loadingBody') }}
              </p>
            </div>
          } @else {
            <div class="space-y-3">
              <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('notification.eyebrow') }}</p>
              <h2 class="m-0 text-3xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('notification.errorTitle') }}</h2>
              <p class="max-w-lg text-sm leading-6 text-[color:var(--text-muted)]">
                {{ errorMessage() }}
              </p>
            </div>
            <p-button [label]="i18n.t('notification.goToSignIn')" routerLink="/login" />
          }
        </div>
      </p-card>
    </div>
  `
})
export class NotificationLoginPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly i18n = inject(I18nService);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal(this.i18n.t('notification.errorFallback'));

  public constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const token = params.get('token');

      if (!token) {
        this.isLoading.set(false);
        return;
      }

      void this.signIn(token);
    });
  }

  private async signIn(token: string) {
    this.isLoading.set(true);

    try {
      const browserProfile = this.i18n.browserProfile();
      const response = await firstValueFrom(
        this.api.signInWithNotificationLink(token, browserProfile.language, browserProfile.country)
      );

      this.authStore.startSession(response);

      if (!response.user.hasPersonality) {
        this.authStore.setPersonalityPromptPending(true);
      }

      const conversationId = response.conversationId;

      if (response.user.requiresProfileCompletion) {
        await this.router.navigate(['/complete-profile'], {
          queryParams: {
            redirect: conversationId ? `/conversations/${conversationId}` : '/conversations'
          }
        });
      } else if (conversationId) {
        await this.router.navigate(['/conversations', conversationId]);
      } else {
        await this.router.navigate(['/conversations']);
      }
    } catch (error) {
      this.errorMessage.set(getApiErrorMessage(error, this.i18n.t('notification.errorFallback')));
      this.isLoading.set(false);
    }
  }
}
