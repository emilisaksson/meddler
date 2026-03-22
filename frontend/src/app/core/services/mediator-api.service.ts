import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AppUser,
  ConversationDetail,
  ConversationGoalOption,
  ConversationSummary,
  SessionResponse
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MediatorApiService {
  private readonly http = inject(HttpClient);

  private buildOptionalLocalePayload(payload: {
    language?: string | null;
    country?: string | null;
  }) {
    return {
      ...(payload.language ? { language: payload.language } : {}),
      ...(payload.country ? { country: payload.country } : {})
    };
  }

  public requestOtp(email: string) {
    return this.http.post<{ email: string; expiresInMinutes: number }>('/api/auth/request-otp', {
      email
    });
  }

  public verifyOtp(payload: {
    email: string;
    code: string;
    name?: string;
    language?: string | null;
    country?: string | null;
  }) {
    return this.http.post<SessionResponse>('/api/auth/verify-otp', {
      email: payload.email,
      code: payload.code,
      name: payload.name,
      ...this.buildOptionalLocalePayload(payload)
    });
  }

  public acceptInvitation(token: string, language?: string | null, country?: string | null) {
    return this.http.post<SessionResponse>('/api/auth/accept-invitation', {
      token,
      ...this.buildOptionalLocalePayload({ language, country })
    });
  }

  public signInWithNotificationLink(
    token: string,
    language?: string | null,
    country?: string | null
  ) {
    return this.http.post<SessionResponse>('/api/auth/notification-link', {
      token,
      ...this.buildOptionalLocalePayload({ language, country })
    });
  }

  public getCurrentUser() {
    return this.http.get<{ user: AppUser }>('/api/auth/me');
  }

  public updateProfile(payload: {
    name: string;
    language?: string | null;
    country?: string | null;
  }) {
    return this.http.patch<{ user: AppUser }>('/api/auth/profile', {
      name: payload.name,
      ...this.buildOptionalLocalePayload(payload)
    });
  }

  public savePersonality(payload: {
    responses: Array<{
      questionId: string;
      answer?: string | null;
    }>;
  }) {
    return this.http.put<{ user: AppUser }>('/api/auth/personality', payload);
  }

  public getGoals() {
    return this.http.get<{ goals: ConversationGoalOption[] }>('/api/meta/goals');
  }

  public listConversations() {
    return this.http.get<{ conversations: ConversationSummary[] }>('/api/conversations');
  }

  public createConversation(payload: {
    inviteeEmail: string;
    issueDescription: string;
    goalKey: string;
  }) {
    return this.http.post<{ conversation: ConversationDetail; acceptUrl?: string }>(
      '/api/conversations',
      payload
    );
  }

  public getConversation(conversationId: string) {
    return this.http.get<{ conversation: ConversationDetail }>(`/api/conversations/${conversationId}`);
  }

  public sendMessage(conversationId: string, content: string) {
    return this.http.post<{ conversation: ConversationDetail; user: AppUser }>(
      `/api/conversations/${conversationId}/messages`,
      { content }
    );
  }
}
