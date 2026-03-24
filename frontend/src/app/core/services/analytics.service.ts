import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const GOOGLE_TAG_ID = 'G-MZ4ZPV2HGY';
const GOOGLE_TAG_SCRIPT_ID = 'google-tag-manager';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

interface AnalyticsWindow extends Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private initialized = false;
  private lastTrackedPath: string | null = null;

  public initialize() {
    if (this.initialized || !this.isEnabled()) {
      return;
    }

    this.initialized = true;
    this.appendTrackingScript();

    const analyticsWindow = this.getWindow();
    if (!analyticsWindow) {
      return;
    }

    const dataLayer = analyticsWindow.dataLayer ?? [];
    analyticsWindow.dataLayer = dataLayer;
    analyticsWindow.gtag = (...args: unknown[]) => {
      dataLayer.push(args);
    };

    analyticsWindow.gtag('js', new Date());
    analyticsWindow.gtag('config', GOOGLE_TAG_ID, {
      send_page_view: false
    });

    this.trackPageView();

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.trackPageView();
      });
  }

  private isEnabled() {
    const analyticsWindow = this.getWindow();
    if (!analyticsWindow) {
      return false;
    }

    return !LOCAL_HOSTNAMES.has(analyticsWindow.location.hostname.toLowerCase());
  }

  private appendTrackingScript() {
    if (this.document.getElementById(GOOGLE_TAG_SCRIPT_ID)) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = GOOGLE_TAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`;

    this.document.head.appendChild(script);
  }

  private trackPageView() {
    console.debug('Tracking page view');
    const analyticsWindow = this.getWindow();
    if (!analyticsWindow?.gtag) {
      return;
    }

    const path = `${analyticsWindow.location.pathname}${analyticsWindow.location.search}${analyticsWindow.location.hash}`;
    if (path === this.lastTrackedPath) {
      return;
    }

    this.lastTrackedPath = path;

    analyticsWindow.gtag('event', 'page_view', {
      page_title: this.document.title,
      page_path: path,
      page_location: analyticsWindow.location.href
    });
  }

  private getWindow(): AnalyticsWindow | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window as AnalyticsWindow;
  }
}
