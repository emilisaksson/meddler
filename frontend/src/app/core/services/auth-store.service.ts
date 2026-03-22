import { computed, Injectable, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { clearStoredAccessToken, getStoredAccessToken, storeAccessToken } from '../auth/auth-storage';
import type { AppUser, SessionResponse } from '../models/api.models';
import { MediatorApiService } from './mediator-api.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(MediatorApiService);
  private hydrationPromise: Promise<void> | null = null;

  public readonly user = signal<AppUser | null>(null);
  public readonly initialized = signal(false);
  public readonly personalityPromptPending = signal(false);
  public readonly isAuthenticated = computed(() => this.user() !== null);
  public readonly requiresProfileCompletion = computed(
    () => this.user()?.requiresProfileCompletion ?? false
  );

  public async hydrate(): Promise<void> {
    if (this.initialized()) {
      return;
    }

    if (this.hydrationPromise) {
      return this.hydrationPromise;
    }

    this.hydrationPromise = this.performHydration();
    return this.hydrationPromise;
  }

  public startSession(response: SessionResponse): void {
    storeAccessToken(response.accessToken);
    this.user.set(response.user);
    this.personalityPromptPending.set(false);
    this.initialized.set(true);
  }

  public updateUser(user: AppUser): void {
    this.user.set(user);

    if (user.hasPersonality) {
      this.personalityPromptPending.set(false);
    }
  }

  public setPersonalityPromptPending(value: boolean): void {
    this.personalityPromptPending.set(value);
  }

  public logout(): void {
    clearStoredAccessToken();
    this.user.set(null);
    this.personalityPromptPending.set(false);
    this.initialized.set(true);
  }

  private async performHydration(): Promise<void> {
    const accessToken = getStoredAccessToken();

    if (!accessToken) {
      this.initialized.set(true);
      this.hydrationPromise = null;
      return;
    }

    try {
      const response = await firstValueFrom(this.api.getCurrentUser());
      this.user.set(response.user);
      this.personalityPromptPending.set(false);
    } catch {
      clearStoredAccessToken();
      this.user.set(null);
      this.personalityPromptPending.set(false);
    } finally {
      this.initialized.set(true);
      this.hydrationPromise = null;
    }
  }
}
