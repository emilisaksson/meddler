import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, EMPTY, filter, interval, map, startWith, switchMap } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import type { ConversationDetail, ConversationMessage } from '../../core/models/api.models';
import { AuthStore } from '../../core/services/auth-store.service';
import { I18nService } from '../../core/services/i18n.service';
import { MediatorApiService } from '../../core/services/mediator-api.service';
import { getApiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-conversation-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardModule, DialogModule, TagModule],
  template: `
    <section class="space-y-6">
      <a routerLink="/conversations" class="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-muted)] no-underline">
        <span class="pi pi-arrow-left"></span>
        {{ i18n.t('conversation.back') }}
      </a>

      @if (pageError()) {
        <div class="rounded-2xl border border-[rgba(177,73,74,0.18)] bg-[rgba(177,73,74,0.08)] px-4 py-3 text-sm text-[color:var(--danger-500)]">
          {{ pageError() }}
        </div>
      }

      @if (isLoading()) {
        <div class="glass-panel rounded-[2rem] p-8 text-sm text-[color:var(--text-muted)]">{{ i18n.t('conversation.loading') }}</div>
      } @else if (conversation(); as currentConversation) {
        <div class="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div class="space-y-4">
            <p-card>
              <div class="space-y-4">
                <div class="flex flex-wrap items-center gap-2">
                  <p-tag [value]="goalLabel(currentConversation.goal.key, currentConversation.goal.label)" severity="secondary" />
                  <p-tag
                    [value]="currentConversation.selfRole === 'inviter' ? i18n.t('conversation.inviterThread') : i18n.t('conversation.inviteeThread')"
                    severity="contrast"
                  />
                </div>

                <div>
                  <p class="m-0 text-sm uppercase tracking-[0.25em] text-[color:var(--text-muted)]">{{ i18n.t('conversation.withLabel') }}</p>
                  <h2 class="mt-2 text-3xl font-semibold text-[color:var(--text-strong)]">{{ currentConversation.counterpartEmail }}</h2>
                </div>

                <div class="rounded-[1.5rem] bg-[rgba(248,250,246,0.96)] p-4">
                  <p class="m-0 text-xs uppercase tracking-[0.25em] text-[color:var(--text-muted)]">{{ i18n.t('conversation.issueLabel') }}</p>
                  <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--text-strong)]">
                    {{ currentConversation.issueDescription }}
                  </p>
                </div>

                <div class="rounded-[1.5rem] border border-[rgba(36,65,72,0.08)] bg-white/80 p-4">
                  <p class="m-0 text-xs uppercase tracking-[0.25em] text-[color:var(--text-muted)]">{{ i18n.t('conversation.stateLabel') }}</p>
                  <p class="mt-3 text-sm font-medium text-[color:var(--text-strong)]">{{ i18n.turnStateLabel(currentConversation.turnState) }}</p>
                </div>
              </div>
            </p-card>

            <p-card>
              <div class="space-y-3">
                <p class="m-0 text-sm uppercase tracking-[0.25em] text-[color:var(--text-muted)]">{{ i18n.t('conversation.replyLabel') }}</p>
                <div class="field-shell rounded-[1.5rem] px-4 py-3">
                  <textarea
                    rows="8"
                    class="min-h-48 w-full resize-none border-none bg-transparent p-0 text-sm leading-7 text-[color:var(--text-strong)] outline-none"
                    [ngModel]="draftMessage()"
                    (ngModelChange)="draftMessage.set($event)"
                    [disabled]="!canReply(currentConversation) || isSending()"
                    [placeholder]="replyPlaceholder(currentConversation)"
                  ></textarea>
                </div>
                <div class="space-y-3">
                  <p class="m-0 max-w-2xl text-sm text-[color:var(--text-muted)]">{{ i18n.t('conversation.replyHelp') }}</p>
                  @if (!hasAvailableCredits()) {
                    <div class="rounded-[1.25rem] border border-[rgba(177,73,74,0.18)] bg-[rgba(177,73,74,0.08)] px-4 py-3 text-sm text-[color:var(--danger-500)]">
                      {{ i18n.t('conversation.noCreditsHint') }}
                    </div>
                  }
                  <div class="flex justify-start sm:justify-end">
                    <button
                      type="button"
                      [disabled]="!canReply(currentConversation) || draftMessage().trim().length === 0"
                      class="w-full rounded-full border border-[color:var(--surface-900)] bg-[color:var(--surface-900)] px-5 py-3 text-sm font-semibold text-white transition sm:w-auto"
                      [class.opacity-60]="!canReply(currentConversation) || draftMessage().trim().length === 0"
                      [class.cursor-not-allowed]="!canReply(currentConversation) || draftMessage().trim().length === 0"
                      (click)="sendMessage()"
                    >
                      {{ isSending() ? i18n.t('conversation.sendingReply') : i18n.t('conversation.sendReply') }}
                    </button>
                  </div>
                </div>
              </div>
            </p-card>
          </div>

          <div class="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div class="flex items-center justify-between gap-4 border-b border-[rgba(36,65,72,0.08)] pb-4">
              <div>
                <p class="m-0 text-sm uppercase tracking-[0.25em] text-[color:var(--text-muted)]">{{ i18n.t('conversation.privateThreadEyebrow') }}</p>
                <h3 class="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">{{ i18n.t('conversation.privateThreadTitle') }}</h3>
              </div>
              <p class="m-0 text-sm text-[color:var(--text-muted)]">{{ i18n.t('conversations.updated') }} {{ currentConversation.updatedAt | date: 'short' }}</p>
            </div>

            <div class="mt-6 space-y-4">
              @if (currentConversation.thread.length === 0) {
                <div class="rounded-[1.5rem] border border-dashed border-[rgba(36,65,72,0.12)] p-6 text-sm leading-6 text-[color:var(--text-muted)]">
                  {{ i18n.t('conversation.emptyThread') }}
                </div>
              } @else {
                @for (message of currentConversation.thread; track message.id) {
                  <div [class]="messageBubbleClass(message)">
                    <div class="mb-2 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em]">
                      <span [class]="messageMetaClass(message)">
                        {{ message.authorType === 'participant' ? i18n.t('conversation.you') : i18n.t('conversation.mediator') }}
                      </span>
                      <span [class]="messageMetaClass(message)">
                        {{ message.createdAt | date: 'short' }}
                      </span>
                    </div>
                    <p class="m-0 whitespace-pre-wrap text-sm leading-7">{{ message.content }}</p>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }
    </section>

    <p-dialog
      [visible]="outOfCreditsDialogVisible()"
      [modal]="true"
      [closable]="false"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '32rem', maxWidth: 'calc(100vw - 2rem)' }"
    >
      <ng-template pTemplate="header">
        <h3 class="m-0 text-xl font-semibold text-[color:var(--text-strong)]">
          {{ i18n.t('conversation.noCreditsTitle') }}
        </h3>
      </ng-template>

      <div class="space-y-4">
        <p class="m-0 text-sm leading-6 text-[color:var(--text-muted)]">
          {{ i18n.t('conversation.noCreditsBody') }}
        </p>

        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-full border border-[color:var(--surface-900)] bg-[color:var(--surface-900)] px-5 py-3 text-sm font-semibold text-white transition"
            (click)="outOfCreditsDialogVisible.set(false)"
          >
            {{ i18n.t('conversation.noCreditsClose') }}
          </button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ConversationPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MediatorApiService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private hasShownOutOfCreditsDialog = false;

  protected readonly i18n = inject(I18nService);
  protected readonly isLoading = signal(true);
  protected readonly isSending = signal(false);
  protected readonly pageError = signal<string | null>(null);
  protected readonly conversation = signal<ConversationDetail | null>(null);
  protected readonly conversationId = signal<string | null>(null);
  protected readonly draftMessage = signal('');
  protected readonly outOfCreditsDialogVisible = signal(false);

  public constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('conversationId')),
        filter((conversationId): conversationId is string => Boolean(conversationId)),
        distinctUntilChanged(),
        switchMap((conversationId) => {
          this.conversationId.set(conversationId);
          this.isLoading.set(true);

          return interval(5000).pipe(
            startWith(0),
            switchMap(() =>
              this.api.getConversation(conversationId).pipe(
                catchError(() => {
                  this.pageError.set(this.i18n.t('conversation.loadError'));
                  this.isLoading.set(false);
                  return EMPTY;
                })
              )
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.conversation.set(response.conversation);
        this.pageError.set(null);
        this.isLoading.set(false);
        this.syncCreditDialogState();
      });
  }

  protected goalLabel(goalKey: string, fallback: string) {
    return this.i18n.goalLabel(goalKey, fallback);
  }

  protected messageBubbleClass(message: ConversationMessage): string {
    const baseClass = 'max-w-3xl rounded-[1.75rem] px-5 py-4 shadow-sm';

    if (message.authorType === 'participant') {
      return `${baseClass} ml-auto bg-[linear-gradient(135deg,#2e7e88,#8f9d45)] text-white`;
    }

    return `${baseClass} border border-[rgba(36,65,72,0.08)] bg-white text-[color:var(--text-strong)]`;
  }

  protected messageMetaClass(message: ConversationMessage): string {
    return message.authorType === 'participant'
      ? 'text-white/70'
      : 'text-[color:var(--text-muted)]';
  }

  protected hasAvailableCredits() {
    return (this.authStore.user()?.credits ?? 0) > 0;
  }

  protected canReply(conversation: ConversationDetail) {
    return conversation.canSend && this.hasAvailableCredits();
  }

  protected replyPlaceholder(conversation: ConversationDetail) {
    if (!this.hasAvailableCredits()) {
      return this.i18n.t('conversation.noCreditsPlaceholder');
    }

    return conversation.canSend
      ? this.i18n.t('conversation.replyPlaceholder')
      : this.i18n.turnStateLabel(conversation.turnState);
  }

  protected async sendMessage() {
    const activeConversationId = this.conversationId();

    if (!activeConversationId || !this.draftMessage().trim()) {
      return;
    }

    this.isSending.set(true);
    this.pageError.set(null);

    try {
      const response = await firstValueFrom(this.api.sendMessage(activeConversationId, this.draftMessage()));
      this.conversation.set(response.conversation);
      this.authStore.updateUser(response.user);
      this.draftMessage.set('');
      this.syncCreditDialogState();
    } catch (error) {
      if (this.isInsufficientCreditsError(error)) {
        try {
          const response = await firstValueFrom(this.api.getCurrentUser());
          this.authStore.updateUser(response.user);
        } catch {
          // Ignore sync failures and preserve the current state.
        }

        this.syncCreditDialogState();
      }

      this.pageError.set(getApiErrorMessage(error, this.i18n.t('conversation.sendError')));
    } finally {
      this.isSending.set(false);
    }
  }

  private syncCreditDialogState() {
    const credits = this.authStore.user()?.credits ?? 0;

    if (credits > 0) {
      this.hasShownOutOfCreditsDialog = false;
      return;
    }

    if (!this.hasShownOutOfCreditsDialog) {
      this.outOfCreditsDialogVisible.set(true);
      this.hasShownOutOfCreditsDialog = true;
    }
  }

  private isInsufficientCreditsError(error: unknown) {
    return error instanceof HttpErrorResponse && error.error?.code === 'insufficient_credits';
  }
}
