import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-complete-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CardModule, InputTextModule],
  template: `
    <div class="mx-auto max-w-2xl">
      <p-card>
        <ng-template pTemplate="header">
          <div class="px-6 pt-6">
            <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('profile.eyebrow') }}</p>
            <h2 class="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('profile.title') }}</h2>
            <p class="mt-3 max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">{{ i18n.t('profile.body') }}</p>
          </div>
        </ng-template>

        <div class="space-y-5">
          @if (errorMessage()) {
            <div class="rounded-2xl border border-[rgba(177,73,74,0.18)] bg-[rgba(177,73,74,0.08)] px-4 py-3 text-sm text-[color:var(--danger-500)]">
              {{ errorMessage() }}
            </div>
          }

          <div class="space-y-2">
            <label class="text-sm font-medium text-[color:var(--text-strong)]" for="profileName">{{ i18n.t('profile.nameLabel') }}</label>
            <div class="field-shell rounded-2xl px-4 py-3">
              <input
                id="profileName"
                pInputText
                class="!border-none !bg-transparent !px-0 !py-0 shadow-none outline-none"
                [(ngModel)]="name"
                [placeholder]="i18n.t('profile.namePlaceholder')"
              >
            </div>
          </div>

          <p-button
            [label]="i18n.t('profile.save')"
            [loading]="isSaving()"
            [disabled]="!name().trim()"
            styleClass="!bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
            (onClick)="save()"
          />
        </div>
      </p-card>
    </div>
  `
})
export class CompleteProfilePageComponent {
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly i18n = inject(I18nService);
  protected readonly browserProfile = this.i18n.browserProfile();
  protected readonly name = signal(this.authStore.user()?.name ?? '');
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async save() {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(
        this.api.updateProfile({
          name: this.name(),
          language: this.browserProfile.language,
          country: this.browserProfile.country
        })
      );

      this.authStore.updateUser(response.user);

      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/conversations';
      await this.router.navigateByUrl(redirect);
    } catch (error) {
      this.errorMessage.set(getApiErrorMessage(error, this.i18n.t('profile.saveError')));
    } finally {
      this.isSaving.set(false);
    }
  }
}
