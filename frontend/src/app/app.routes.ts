import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LoginPageComponent } from './features/auth/login-page.component';
import { CompleteProfilePageComponent } from './features/auth/complete-profile-page.component';
import { NotificationLoginPageComponent } from './features/auth/notification-login-page.component';
import { ConversationPageComponent } from './features/conversations/conversation-page.component';
import { ConversationsPageComponent } from './features/conversations/conversations-page.component';
import { AcceptInvitationPageComponent } from './features/invitations/accept-invitation-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'conversations'
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'accept-invitation',
    component: AcceptInvitationPageComponent
  },
  {
    path: 'open-conversation',
    component: NotificationLoginPageComponent
  },
  {
    path: 'complete-profile',
    component: CompleteProfilePageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'conversations',
    component: ConversationsPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'conversations/:conversationId',
    component: ConversationPageComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'conversations'
  }
];
