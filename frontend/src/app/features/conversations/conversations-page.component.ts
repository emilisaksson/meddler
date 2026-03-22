import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import type { ConversationGoalOption, ConversationSummary } from '../../core/models/api.models';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-conversations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TagModule
  ],
  template: `
    <section class="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <p-card>
        <ng-template pTemplate="header">
          <div class="px-6 pt-6">
            <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('conversations.inviteEyebrow') }}</p>
            <h2 class="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('conversations.inviteTitle') }}</h2>
            <p class="mt-3 max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">{{ i18n.t('conversations.inviteBody') }}</p>
          </div>
        </ng-template>

        <div class="space-y-5">
          @if (pageError()) {
            <div class="rounded-2xl border border-[rgba(177,73,74,0.18)] bg-[rgba(177,73,74,0.08)] px-4 py-3 text-sm text-[color:var(--danger-500)]">
              {{ pageError() }}
            </div>
          }

          <div class="space-y-2">
            <label class="text-sm font-medium text-[color:var(--text-strong)]" for="inviteeEmail">{{ i18n.t('conversations.inviteeEmailLabel') }}</label>
            <div class="field-shell rounded-2xl px-4 py-3">
              <input
                id="inviteeEmail"
                pInputText
                type="email"
                class="!border-none !bg-transparent !px-0 !py-0 shadow-none outline-none"
                [(ngModel)]="inviteeEmail"
                [placeholder]="i18n.t('conversations.inviteeEmailPlaceholder')"
              >
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-[color:var(--text-strong)]" for="goal">{{ i18n.t('conversations.goalLabel') }}</label>
            <p-select
              inputId="goal"
              [options]="translatedGoalOptions()"
              optionLabel="label"
              optionValue="key"
              [placeholder]="i18n.t('conversations.goalPlaceholder')"
              [(ngModel)]="selectedGoalKey"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-[color:var(--text-strong)]" for="issue">{{ i18n.t('conversations.issueLabel') }}</label>
            <div class="field-shell rounded-[1.5rem] px-4 py-3">
              <textarea
                id="issue"
                rows="7"
                class="min-h-40 w-full resize-none border-none bg-transparent p-0 text-sm leading-7 text-[color:var(--text-strong)] outline-none"
                [(ngModel)]="issueDescription"
                [placeholder]="i18n.t('conversations.issuePlaceholder')"
              ></textarea>
            </div>
          </div>

          <p-button
            [label]="i18n.t('conversations.sendInvite')"
            [loading]="isSaving()"
            [disabled]="!canSubmitInvite()"
            styleClass="!bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
            (onClick)="createConversation()"
          />

          @if (lastAcceptUrl()) {
            <div class="rounded-[1.5rem] border border-[rgba(79,143,115,0.18)] bg-[rgba(79,143,115,0.08)] p-4">
              <p class="m-0 text-sm font-semibold text-[color:var(--text-strong)]">{{ i18n.t('conversations.devLinkTitle') }}</p>
              <p class="mt-2 break-all text-sm leading-6 text-[color:var(--text-muted)]">{{ lastAcceptUrl() }}</p>
            </div>
          }
        </div>
      </p-card>

      <div class="space-y-4">
        <div class="glass-panel rounded-[2rem] p-6">
          <p class="m-0 text-sm uppercase tracking-[0.3em] text-[color:var(--text-muted)]">{{ i18n.t('conversations.listEyebrow') }}</p>
          <div class="mt-3 flex items-center justify-between gap-4">
            <h2 class="m-0 text-3xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('conversations.listTitle') }}</h2>
            <p-button
              [label]="i18n.t('conversations.refresh')"
              severity="secondary"
              [outlined]="true"
              [loading]="isLoading()"
              (onClick)="loadPage()"
            />
          </div>
        </div>

        @if (isLoading()) {
          <div class="glass-panel rounded-[2rem] p-8 text-sm text-[color:var(--text-muted)]">{{ i18n.t('conversations.loading') }}</div>
        } @else if (conversations().length === 0) {
          <div class="glass-panel rounded-[2rem] p-8">
            <h3 class="m-0 text-xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('conversations.emptyTitle') }}</h3>
            <p class="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{{ i18n.t('conversations.emptyBody') }}</p>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (conversation of conversations(); track conversation.id) {
              <a
                [routerLink]="['/conversations', conversation.id]"
                class="glass-panel block rounded-[2rem] p-5 text-inherit no-underline transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div class="space-y-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <p-tag [value]="goalLabel(conversation.goal.key, conversation.goal.label)" severity="secondary" />
                      <span class="text-xs uppercase tracking-[0.25em] text-[color:var(--text-muted)]">
                        {{ conversation.selfRole === 'inviter' ? i18n.t('conversations.youInvited') : i18n.t('conversations.youWereInvited') }}
                      </span>
                    </div>
                    <h3 class="m-0 text-xl font-semibold text-[color:var(--text-strong)]">
                      {{ conversation.counterpartEmail }}
                    </h3>
                    <p class="m-0 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                      {{ conversation.issueDescription }}
                    </p>
                  </div>
                  <div class="rounded-[1.5rem] bg-[rgba(248,250,246,0.92)] px-4 py-3 text-sm text-[color:var(--text-muted)]">
                    <p class="m-0 font-medium text-[color:var(--text-strong)]">{{ i18n.turnStateLabel(conversation.turnState) }}</p>
                    <p class="m-0 mt-2">{{ i18n.t('conversations.updated') }} {{ conversation.updatedAt | date: 'medium' }}</p>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>
  `
})
export class ConversationsPageComponent {
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly i18n = inject(I18nService);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly pageError = signal<string | null>(null);
  protected readonly conversations = signal<ConversationSummary[]>([]);
  protected readonly goalOptions = signal<ConversationGoalOption[]>([]);
  protected readonly translatedGoalOptions = computed(() =>
    this.goalOptions().map((goal) => ({
      ...goal,
      label: this.goalLabel(goal.key, goal.label)
    }))
  );
  protected readonly inviteeEmail = signal('');
  protected readonly selectedGoalKey = signal<string | null>(null);
  protected readonly issueDescription = signal('');
  protected readonly lastAcceptUrl = signal<string | null>(null);

  public constructor() {
    void this.loadPage();
  }

  protected goalLabel(goalKey: string, fallback: string) {
    return this.i18n.goalLabel(goalKey, fallback);
  }

  protected canSubmitInvite() {
    return (
      this.inviteeEmail().trim().length > 0 &&
      (this.selectedGoalKey()?.trim().length ?? 0) > 0 &&
      this.issueDescription().trim().length >= 20 &&
      !this.isSaving()
    );
  }

  protected async loadPage() {
    this.isLoading.set(true);
    this.pageError.set(null);

    try {
      const [goalsResponse, conversationsResponse] = await Promise.all([
        firstValueFrom(this.api.getGoals()),
        firstValueFrom(this.api.listConversations())
      ]);

      this.goalOptions.set(goalsResponse.goals);
      this.conversations.set(conversationsResponse.conversations);
      this.selectedGoalKey.set(this.selectedGoalKey() ?? goalsResponse.goals[0]?.key ?? null);
    } catch (error) {
      this.pageError.set(getApiErrorMessage(error, this.i18n.t('conversations.loadError')));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async createConversation() {
    this.isSaving.set(true);
    this.pageError.set(null);

    try {
      const response = await firstValueFrom(
        this.api.createConversation({
          inviteeEmail: this.inviteeEmail(),
          issueDescription: this.issueDescription(),
          goalKey: this.selectedGoalKey() ?? ''
        })
      );

      this.lastAcceptUrl.set(response.acceptUrl ?? null);
      this.inviteeEmail.set('');
      this.issueDescription.set('');

      if (!this.authStore.user()?.hasPersonality) {
        this.authStore.setPersonalityPromptPending(true);
      }

      await this.loadPage();
      await this.router.navigate(['/conversations', response.conversation.id]);
    } catch (error) {
      this.pageError.set(getApiErrorMessage(error, this.i18n.t('conversations.createError')));
    } finally {
      this.isSaving.set(false);
    }
  }
}
