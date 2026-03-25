import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from './i18n.service';

type SupportedUiLanguage = 'en' | 'sv';
type SeoKey =
  | 'landing'
  | 'howItWorks'
  | 'benefits'
  | 'whoItsFor'
  | 'acceptInvitation'
  | 'openConversation'
  | 'completeProfile'
  | 'conversations'
  | 'conversationDetail';

interface SeoContent {
  title: string;
  description: string;
  canonicalPath?: string;
  keywords?: string;
  robots?: string;
  ogType?: string;
}

const seoContentByLanguage: Record<SupportedUiLanguage, Record<SeoKey, SeoContent>> = {
  en: {
    landing: {
      title: 'oliveaccord | Private AI Mediation for Difficult Conversations',
      description:
        'oliveaccord helps two people handle difficult conversations through private AI-mediated threads, calmer wording, and guided step-by-step progress.',
      canonicalPath: '/',
      keywords:
        'AI mediator, difficult conversations, private conversation tool, conflict resolution app, relationship communication tool, mediated messaging',
      robots: 'index, follow',
      ogType: 'website'
    },
    howItWorks: {
      title: 'How oliveaccord Works | Private AI Mediation Explained',
      description:
        'Learn how oliveaccord uses private threads and AI mediation to reframe tense messages into calmer, clearer communication between two people.',
      canonicalPath: '/how-it-works',
      keywords:
        'how AI mediation works, private AI conversation, mediated messaging process, conflict de-escalation tool',
      robots: 'index, follow',
      ogType: 'article'
    },
    benefits: {
      title: 'Benefits of oliveaccord | Calmer and More Private Conversations',
      description:
        'See how oliveaccord reduces escalation, protects raw messages, and helps people move forward with clearer and more constructive communication.',
      canonicalPath: '/benefits',
      keywords:
        'benefits of AI mediator, calmer communication, private messaging benefits, relationship conflict support',
      robots: 'index, follow',
      ogType: 'article'
    },
    whoItsFor: {
      title: "Who oliveaccord Is For | AI Support for Hard Conversations",
      description:
        'oliveaccord is built for couples, family members, friends, and other people who need a more private and structured way to handle sensitive conversations.',
      canonicalPath: '/who-its-for',
      keywords:
        'AI support for couples, family conflict tool, difficult conversation app, healthy boundary conversations',
      robots: 'index, follow',
      ogType: 'article'
    },
    acceptInvitation: {
      title: 'Open Your Private Invitation | oliveaccord',
      description: 'Open a secure invitation to a private mediated conversation in oliveaccord.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    openConversation: {
      title: 'Open Conversation | oliveaccord',
      description: 'Open your latest private oliveaccord conversation through a secure access link.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    completeProfile: {
      title: 'Complete Your Profile | oliveaccord',
      description: 'Complete your oliveaccord profile before entering your private mediated conversations.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    conversations: {
      title: 'Your Private Conversations | oliveaccord',
      description: 'Manage your private oliveaccord conversation threads and invite someone into a mediated exchange.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    conversationDetail: {
      title: 'Private Conversation Thread | oliveaccord',
      description: 'Continue a private mediated conversation inside oliveaccord.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    }
  },
  sv: {
    landing: {
      title: 'oliveaccord | Privat AI-medling för svåra samtal',
      description:
        'oliveaccord hjälper två personer genom svåra samtal med privata AI-medlade trådar, lugnare formuleringar och strukturerade steg framåt.',
      canonicalPath: '/',
      keywords:
        'AI-medling, svåra samtal, privat samtalsverktyg, konflikthantering, relationskommunikation, medlade meddelanden',
      robots: 'index, follow',
      ogType: 'website'
    },
    howItWorks: {
      title: 'Så fungerar oliveaccord | Privat AI-medling förklarad',
      description:
        'Läs hur oliveaccord använder privata trådar och AI-medling för att omformulera spända meddelanden till lugnare och tydligare kommunikation.',
      canonicalPath: '/how-it-works',
      keywords:
        'hur AI-medling fungerar, privat AI-samtal, medlad kommunikation, konfliktdämpning',
      robots: 'index, follow',
      ogType: 'article'
    },
    benefits: {
      title: 'Fördelar med oliveaccord | Lugnare och mer privata samtal',
      description:
        'Se hur oliveaccord minskar eskalering, skyddar råa formuleringar och hjälper människor vidare med tydligare och mer konstruktiv kommunikation.',
      canonicalPath: '/benefits',
      keywords:
        'fördelar med AI-medling, lugnare kommunikation, privata meddelanden, stöd i relationskonflikter',
      robots: 'index, follow',
      ogType: 'article'
    },
    whoItsFor: {
      title: 'Vem oliveaccord är till för | AI-stöd för svåra samtal',
      description:
        'oliveaccord är byggt för par, familjemedlemmar, vänner och andra som behöver ett mer privat och strukturerat sätt att hantera känsliga samtal.',
      canonicalPath: '/who-its-for',
      keywords:
        'AI-stöd för par, familjekonflikt verktyg, svåra samtal app, sätta gränser samtal',
      robots: 'index, follow',
      ogType: 'article'
    },
    acceptInvitation: {
      title: 'Öppna din privata inbjudan | oliveaccord',
      description: 'Öppna en säker inbjudan till ett privat medlat samtal i oliveaccord.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    openConversation: {
      title: 'Öppna samtal | oliveaccord',
      description: 'Öppna ditt senaste privata oliveaccord-samtal via en säker länk.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    completeProfile: {
      title: 'Slutför din profil | oliveaccord',
      description: 'Slutför din oliveaccord-profil innan du går in i dina privata medlade samtal.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    conversations: {
      title: 'Dina privata samtal | oliveaccord',
      description: 'Hantera dina privata oliveaccord-trådar och bjud in någon till ett medlat samtal.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    },
    conversationDetail: {
      title: 'Privat samtalstråd | oliveaccord',
      description: 'Fortsätt ett privat medlat samtal i oliveaccord.',
      robots: 'noindex, nofollow',
      ogType: 'website'
    }
  }
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private initialized = false;

  public initialize() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.apply();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.apply();
      });
  }

  private apply() {
    const language = this.i18n.language();
    const seo = this.resolveSeo(language);
    const canonicalUrl = this.resolveCanonicalUrl(seo.canonicalPath);

    this.document.documentElement.lang = language;
    this.title.setTitle(seo.title);

    this.meta.updateTag({ name: 'description', content: seo.description }, 'name="description"');
    this.meta.updateTag({ name: 'robots', content: seo.robots ?? 'index, follow' }, 'name="robots"');

    if (seo.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seo.keywords }, 'name="keywords"');
    } else {
      this.meta.removeTag('name="keywords"');
    }

    this.meta.updateTag({ property: 'og:site_name', content: 'oliveaccord' }, 'property="og:site_name"');
    this.meta.updateTag({ property: 'og:title', content: seo.title }, 'property="og:title"');
    this.meta.updateTag(
      { property: 'og:description', content: seo.description },
      'property="og:description"'
    );
    this.meta.updateTag({ property: 'og:type', content: seo.ogType ?? 'website' }, 'property="og:type"');
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl }, 'property="og:url"');
    this.meta.updateTag(
      { property: 'og:locale', content: language === 'sv' ? 'sv_SE' : 'en_US' },
      'property="og:locale"'
    );

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' }, 'name="twitter:card"');
    this.meta.updateTag({ name: 'twitter:title', content: seo.title }, 'name="twitter:title"');
    this.meta.updateTag(
      { name: 'twitter:description', content: seo.description },
      'name="twitter:description"'
    );

    this.upsertCanonical(canonicalUrl);
  }

  private resolveSeo(language: SupportedUiLanguage): SeoContent {
    const seoKey = this.resolveSeoKey(this.router.routerState.snapshot.root);
    return seoContentByLanguage[language][seoKey];
  }

  private resolveSeoKey(snapshot: ActivatedRouteSnapshot): SeoKey {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let seoKey: SeoKey = 'landing';

    while (current) {
      const routeSeoKey = current.data['seoKey'] as SeoKey | undefined;
      if (routeSeoKey) {
        seoKey = routeSeoKey;
      }

      current = current.firstChild;
    }

    return seoKey;
  }

  private resolveCanonicalUrl(path?: string): string {
    const currentWindow = this.getWindow();

    if (!currentWindow) {
      return path ?? '/';
    }

    if (path) {
      return new URL(path, currentWindow.location.origin).toString();
    }

    return new URL(currentWindow.location.pathname, currentWindow.location.origin).toString();
  }

  private upsertCanonical(href: string) {
    let link = this.document.head.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', href);
  }

  private getWindow(): Window | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window;
  }
}
