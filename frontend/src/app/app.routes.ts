import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LoginPageComponent } from './features/auth/login-page.component';
import { CompleteProfilePageComponent } from './features/auth/complete-profile-page.component';
import { NotificationLoginPageComponent } from './features/auth/notification-login-page.component';
import { ConversationPageComponent } from './features/conversations/conversation-page.component';
import { ConversationsPageComponent } from './features/conversations/conversations-page.component';
import { AcceptInvitationPageComponent } from './features/invitations/accept-invitation-page.component';
import { MarketingPageComponent } from './features/marketing/marketing-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    canActivate: [guestGuard],
    data: {
      seoKey: 'landing'
    }
  },
  {
    path: 'login',
    pathMatch: 'full',
    redirectTo: ''
  },
  {
    path: 'how-it-works',
    component: MarketingPageComponent,
    canActivate: [guestGuard],
    data: {
      marketingPageId: 'how-it-works',
      seoKey: 'howItWorks'
    }
  },
  {
    path: 'benefits',
    component: MarketingPageComponent,
    canActivate: [guestGuard],
    data: {
      marketingPageId: 'benefits',
      seoKey: 'benefits'
    }
  },
  {
    path: 'who-its-for',
    component: MarketingPageComponent,
    canActivate: [guestGuard],
    data: {
      marketingPageId: 'who-its-for',
      seoKey: 'whoItsFor'
    }
  },
  {
    path: 'accept-invitation',
    component: AcceptInvitationPageComponent,
    data: {
      seoKey: 'acceptInvitation'
    }
  },
  {
    path: 'open-conversation',
    component: NotificationLoginPageComponent,
    data: {
      seoKey: 'openConversation'
    }
  },
  {
    path: 'complete-profile',
    component: CompleteProfilePageComponent,
    canActivate: [authGuard],
    data: {
      seoKey: 'completeProfile'
    }
  },
  {
    path: 'conversations',
    component: ConversationsPageComponent,
    canActivate: [authGuard],
    data: {
      seoKey: 'conversations'
    }
  },
  {
    path: 'conversations/:conversationId',
    component: ConversationPageComponent,
    canActivate: [authGuard],
    data: {
      seoKey: 'conversationDetail'
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
