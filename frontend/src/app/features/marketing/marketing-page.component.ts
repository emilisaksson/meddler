import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { I18nService } from '../../core/services/i18n.service';

type SupportedUiLanguage = 'en' | 'sv';
type MarketingPageId = 'how-it-works' | 'benefits' | 'who-its-for';

interface MarketingSection {
  title: string;
  body: string;
  points: string[];
}

interface MarketingFaq {
  question: string;
  answer: string;
}

interface MarketingPageLink {
  href: string;
  label: string;
  description: string;
}

interface MarketingPageContent {
  eyebrow: string;
  title: string;
  lead: string;
  highlightsTitle: string;
  highlights: string[];
  sections: MarketingSection[];
  faqEyebrow: string;
  faqTitle: string;
  faq: MarketingFaq[];
  relatedTitle: string;
  relatedPages: MarketingPageLink[];
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
}

const marketingPageContentByLanguage: Record<
  SupportedUiLanguage,
  Record<MarketingPageId, MarketingPageContent>
> = {
  en: {
    'how-it-works': {
      eyebrow: 'How it works',
      title: 'A private AI mediator between two separate threads.',
      lead:
        'oliveaccord is designed for difficult conversations where honesty matters, but raw wording can make things worse. Each participant writes privately to Olive, and Olive relays the intent in calmer language.',
      highlightsTitle: 'What happens in practice',
      highlights: [
        'Each person gets a private thread instead of a shared chat room.',
        'Olive reframes tone before a message reaches the other person.',
        'The conversation moves forward one turn at a time with clear context.'
      ],
      sections: [
        {
          title: '1. Start with private context',
          body:
            'The person starting the conversation describes what is difficult, what they hope changes, and who they want to invite. That gives Olive context before the exchange begins.',
          points: [
            'You set the issue and the goal before the first reply.',
            'The other person joins through a secure invitation link.',
            'Both people keep their own private workspace.'
          ]
        },
        {
          title: '2. Olive rewrites before relaying',
          body:
            'Participants can write honestly in their own thread. Olive then reframes the intent into clearer, steadier language before it is sent onward.',
          points: [
            'Raw wording is not shown directly to the other person.',
            'Emotion and intent are preserved without forwarding the sharpest phrasing.',
            'The result is usually easier to hear and respond to.'
          ]
        },
        {
          title: '3. The conversation stays structured',
          body:
            'oliveaccord keeps the exchange paced and organized. That reduces pile-ons, reactive back-and-forth loops, and the confusion that comes from several emotional points landing at once.',
          points: [
            'Each step has a clear turn state.',
            'Both sides can focus on one reply at a time.',
            'Olive keeps the process moving instead of letting it spiral.'
          ]
        }
      ],
      faqEyebrow: 'Questions',
      faqTitle: 'Common questions about the mediation flow',
      faq: [
        {
          question: 'Does the other person see my exact raw message?',
          answer:
            'No. The core idea is that each person writes privately to Olive, and Olive relays a calmer version of the intent instead of exposing the original wording directly.'
        },
        {
          question: 'Is there a shared group chat?',
          answer:
            'No. oliveaccord is built around two private threads. That is one of the main ways it reduces escalation and keeps the exchange contained.'
        },
        {
          question: 'Can this help when a conversation already feels tense?',
          answer:
            'That is the use case the product is built around. It gives both people more space to be honest without turning the next message into another flashpoint.'
        }
      ],
      relatedTitle: 'Explore more',
      relatedPages: [
        {
          href: '/benefits',
          label: 'Benefits',
          description: 'See why private AI mediation can feel calmer and more productive.'
        },
        {
          href: '/who-its-for',
          label: "Who it's for",
          description: 'Read about the kinds of conversations oliveaccord is built to support.'
        },
        {
          href: '/',
          label: 'Try it yourself',
          description: 'Open the landing page and start with a one-time access code.'
        }
      ],
      ctaTitle: 'Try the flow yourself',
      ctaBody:
        'The front page lets you request a one-time code and see how oliveaccord starts a private mediated conversation.',
      ctaLabel: 'Try it yourself'
    },
    benefits: {
      eyebrow: 'Benefits',
      title: 'Why people use oliveaccord instead of sending one more reactive message.',
      lead:
        'oliveaccord is useful when direct communication keeps breaking down. It adds privacy, pacing, and a calmer relay layer so difficult conversations have a better chance of moving forward.',
      highlightsTitle: 'Main benefits',
      highlights: [
        'Lower emotional escalation when wording is likely to trigger defensiveness.',
        'Better clarity when both people are talking past each other.',
        'A more structured process for apologies, repair, boundaries, and decisions.'
      ],
      sections: [
        {
          title: 'Protect raw emotion without weaponizing it',
          body:
            'People often need to say what they really feel before they can say it well. oliveaccord creates room for that first draft while preventing the harshest version from being sent as-is.',
          points: [
            'You can be candid in private.',
            'Olive helps separate intent from reactive phrasing.',
            'The other person receives something easier to engage with.'
          ]
        },
        {
          title: 'Create more signal and less chaos',
          body:
            'Hard conversations often collapse because too many hurts, assumptions, and counterpoints land all at once. oliveaccord slows the pace down enough for each step to become clearer.',
          points: [
            'The turn-based structure reduces message pile-ons.',
            'A defined goal keeps the conversation anchored.',
            'Both people can understand the point before reacting to it.'
          ]
        },
        {
          title: 'Support repair instead of point-scoring',
          body:
            'If the real goal is repair, mutual understanding, or healthier boundaries, a calmer delivery matters. oliveaccord is built around that need rather than around instant-fire replies.',
          points: [
            'Useful for rebuilding trust after a hurt.',
            'Helpful when one person shuts down and the other escalates.',
            'A better environment for conversations that need care instead of speed.'
          ]
        }
      ],
      faqEyebrow: 'Questions',
      faqTitle: 'What benefit should you expect first?',
      faq: [
        {
          question: 'Will this solve every conflict automatically?',
          answer:
            'No. The main benefit is not magic agreement. It is better conditions for honesty, clarity, and constructive replies when the normal channel keeps failing.'
        },
        {
          question: 'Is this mainly for romantic relationships?',
          answer:
            'No. It can also fit family issues, friendships, housemate conflicts, and any sensitive conversation where a calmer relay helps.'
        },
        {
          question: 'Why not just ask people to be more polite?',
          answer:
            'Because people are often least polished when the stakes are highest. oliveaccord is useful precisely when ordinary self-editing is not working well enough.'
        }
      ],
      relatedTitle: 'Explore more',
      relatedPages: [
        {
          href: '/how-it-works',
          label: 'How it works',
          description: 'See the private-thread mediation process step by step.'
        },
        {
          href: '/who-its-for',
          label: "Who it's for",
          description: 'Find out which kinds of sensitive conversations fit best.'
        },
        {
          href: '/',
          label: 'Try it yourself',
          description: 'Request a one-time code and explore the product directly.'
        }
      ],
      ctaTitle: 'See the benefits in the product',
      ctaBody:
        'The landing page lets you request access immediately and start a mediated conversation workflow.',
      ctaLabel: 'Go to the front page'
    },
    'who-its-for': {
      eyebrow: "Who it's for",
      title: 'Built for conversations that matter too much to leave to raw messaging alone.',
      lead:
        'oliveaccord is for people who care about the relationship or the outcome, but need help getting through the next hard exchange without making things worse.',
      highlightsTitle: 'Typical use cases',
      highlights: [
        'Partners or ex-partners trying to de-escalate a charged topic.',
        'Family members working through hurt, distance, or mismatched expectations.',
        'Friends, housemates, or co-parents handling boundaries or shared decisions.'
      ],
      sections: [
        {
          title: 'Couples, partners, and relationship repair',
          body:
            'When a discussion turns into defensiveness, withdrawal, or repeated misunderstandings, oliveaccord can provide a calmer bridge. That is useful both for ongoing relationships and for difficult post-relationship conversations.',
          points: [
            'Repair after an argument or breach of trust.',
            'Talking about unmet needs without another explosion.',
            'Working toward a shared decision with less heat.'
          ]
        },
        {
          title: 'Family and close personal relationships',
          body:
            'Some of the hardest conversations happen with people who know us well. That history makes wording more loaded, which is exactly where a private mediation layer can help.',
          points: [
            'Parent-adult child tension.',
            'Sibling conflict and lingering hurt.',
            'Recurring family patterns that keep derailing direct talks.'
          ]
        },
        {
          title: 'Boundaries, apologies, and sensitive decisions',
          body:
            'oliveaccord fits cases where someone needs to say something difficult clearly, but wants a better chance of being heard than a raw text message would provide.',
          points: [
            'Setting healthier boundaries.',
            'Apologizing without losing the point in defensiveness.',
            'Handling emotionally loaded practical decisions.'
          ]
        }
      ],
      faqEyebrow: 'Questions',
      faqTitle: 'Is this the right fit for your conversation?',
      faq: [
        {
          question: 'Do both people need to be highly technical to use it?',
          answer:
            'No. The product flow is simple: one person starts, the other joins through a link, and both interact through guided private threads.'
        },
        {
          question: 'Can this work when one person is hesitant to talk at all?',
          answer:
            'Often that is exactly when structure helps. A calmer, less exposed format can make it easier for someone to stay in the conversation.'
        },
        {
          question: 'Is this meant for workplace disputes too?',
          answer:
            'The strongest fit in the current product framing is personal relationships and sensitive one-to-one conversations, but the same structure can be useful anywhere calmer relay matters.'
        }
      ],
      relatedTitle: 'Explore more',
      relatedPages: [
        {
          href: '/how-it-works',
          label: 'How it works',
          description: 'Understand the private-thread system and Olive’s relay role.'
        },
        {
          href: '/benefits',
          label: 'Benefits',
          description: 'Read the main reasons people choose a mediated flow.'
        },
        {
          href: '/',
          label: 'Try it yourself',
          description: 'Head back to the front page and request your access code.'
        }
      ],
      ctaTitle: 'See whether the workflow fits your situation',
      ctaBody:
        'Start from the front page, request a code, and explore the private conversation flow directly.',
      ctaLabel: 'Try oliveaccord'
    }
  },
  sv: {
    'how-it-works': {
      eyebrow: 'Så fungerar det',
      title: 'En privat AI-medlare mellan två separata trådar.',
      lead:
        'oliveaccord är byggt för svåra samtal där ärlighet behövs, men där råa formuleringar lätt förvärrar läget. Varje deltagare skriver privat till Olive, och Olive förmedlar avsikten i lugnare språk.',
      highlightsTitle: 'Så går det till i praktiken',
      highlights: [
        'Varje person får en privat tråd i stället för ett gemensamt chattrum.',
        'Olive omformulerar tonen innan ett meddelande når den andra personen.',
        'Samtalet förs framåt ett steg i taget med tydligt sammanhang.'
      ],
      sections: [
        {
          title: '1. Börja med privat kontext',
          body:
            'Den som startar samtalet beskriver vad som är svårt, vad som behöver förändras och vem som ska bjudas in. Det ger Olive sammanhang innan utbytet börjar.',
          points: [
            'Du sätter problem och mål innan första svaret.',
            'Den andra personen går med via en säker inbjudningslänk.',
            'Båda personerna behåller sin egen privata yta.'
          ]
        },
        {
          title: '2. Olive skriver om innan något förs vidare',
          body:
            'Deltagarna kan skriva ärligt i sin egen tråd. Olive omformulerar sedan avsikten till tydligare och lugnare språk innan den skickas vidare.',
          points: [
            'Råa formuleringar visas inte direkt för den andra personen.',
            'Känsla och avsikt bevaras utan att den skarpaste formuleringen skickas vidare.',
            'Resultatet blir ofta lättare att ta emot och svara på.'
          ]
        },
        {
          title: '3. Samtalet hålls strukturerat',
          body:
            'oliveaccord håller tempot och ordningen i samtalet. Det minskar kedjor av reaktiva svar och den förvirring som uppstår när flera känsliga punkter landar samtidigt.',
          points: [
            'Varje steg har ett tydligt tur-läge.',
            'Båda sidor kan fokusera på ett svar i taget.',
            'Olive hjälper processen framåt i stället för att låta den spåra ur.'
          ]
        }
      ],
      faqEyebrow: 'Frågor',
      faqTitle: 'Vanliga frågor om medlingsflödet',
      faq: [
        {
          question: 'Ser den andra personen mitt exakta råa meddelande?',
          answer:
            'Nej. Grundidén är att varje person skriver privat till Olive, och att Olive förmedlar en lugnare version av avsikten i stället för att visa originalformuleringen direkt.'
        },
        {
          question: 'Finns det ett gemensamt gruppchattrum?',
          answer:
            'Nej. oliveaccord bygger på två privata trådar. Det är ett av de viktigaste sätten produkten minskar eskalering och håller samtalet mer samlat.'
        },
        {
          question: 'Kan det här hjälpa när samtalet redan känns spänt?',
          answer:
            'Det är precis det användningsfallet produkten är byggd för. Båda får mer utrymme att vara ärliga utan att nästa meddelande blir ännu en tändpunkt.'
        }
      ],
      relatedTitle: 'Utforska mer',
      relatedPages: [
        {
          href: '/benefits',
          label: 'Fördelar',
          description: 'Se varför privat AI-medling kan kännas lugnare och mer produktiv.'
        },
        {
          href: '/who-its-for',
          label: 'Vem det är för',
          description: 'Läs om vilka typer av känsliga samtal oliveaccord är byggt för.'
        },
        {
          href: '/',
          label: 'Prova själv',
          description: 'Öppna startsidan och börja med en engångskod via e-post.'
        }
      ],
      ctaTitle: 'Prova flödet själv',
      ctaBody:
        'På startsidan kan du begära en engångskod och se hur oliveaccord startar ett privat medlat samtal.',
      ctaLabel: 'Prova själv'
    },
    benefits: {
      eyebrow: 'Fördelar',
      title: 'Varför människor använder oliveaccord i stället för att skicka ännu ett reaktivt meddelande.',
      lead:
        'oliveaccord är användbart när direkt kommunikation fortsätter bryta samman. Det tillför integritet, tempo och ett lugnare mellanlager så att svåra samtal får bättre chans att röra sig framåt.',
      highlightsTitle: 'Viktigaste fördelarna',
      highlights: [
        'Mindre känslomässig eskalering när formuleringar lätt väcker försvar.',
        'Bättre tydlighet när båda pratar förbi varandra.',
        'En mer strukturerad process för ursäkter, reparation, gränser och beslut.'
      ],
      sections: [
        {
          title: 'Skydda rå känsla utan att göra den till vapen',
          body:
            'Människor behöver ofta säga vad de verkligen känner innan de kan säga det väl. oliveaccord skapar utrymme för det första utkastet utan att den hårdaste versionen skickas vidare som den är.',
          points: [
            'Du kan vara uppriktig i privat läge.',
            'Olive hjälper till att skilja avsikt från reaktiv formulering.',
            'Den andra personen får något som är lättare att möta konstruktivt.'
          ]
        },
        {
          title: 'Mer signal och mindre kaos',
          body:
            'Svåra samtal kollapsar ofta för att för många sår, antaganden och motargument kommer samtidigt. oliveaccord sänker tempot nog för att varje steg ska bli tydligare.',
          points: [
            'Turordningen minskar högar av meddelanden.',
            'Ett tydligt mål håller samtalet förankrat.',
            'Båda kan förstå poängen innan de reagerar på den.'
          ]
        },
        {
          title: 'Stöd för reparation i stället för poängräkning',
          body:
            'Om det verkliga målet är reparation, ömsesidig förståelse eller sundare gränser spelar lugnare förmedling stor roll. oliveaccord är byggt för just det behovet.',
          points: [
            'Användbart för att återbygga tillit efter en sårande händelse.',
            'Hjälpsamt när en person stänger ner och den andra trappar upp.',
            'En bättre miljö för samtal som kräver omsorg i stället för hastighet.'
          ]
        }
      ],
      faqEyebrow: 'Frågor',
      faqTitle: 'Vilken nytta märks först?',
      faq: [
        {
          question: 'Löser detta varje konflikt automatiskt?',
          answer:
            'Nej. Den viktigaste nyttan är inte magisk enighet, utan bättre förutsättningar för ärlighet, tydlighet och konstruktiva svar när den vanliga kanalen inte fungerar.'
        },
        {
          question: 'Är detta främst för romantiska relationer?',
          answer:
            'Nej. Det kan också passa familjefrågor, vänskaper, konflikter mellan boende och andra känsliga samtal där en lugnare förmedling hjälper.'
        },
        {
          question: 'Varför inte bara be människor vara artigare?',
          answer:
            'För att människor ofta är som minst slipade när insatserna känns som störst. oliveaccord är användbart just när vanlig självcensur inte räcker.'
        }
      ],
      relatedTitle: 'Utforska mer',
      relatedPages: [
        {
          href: '/how-it-works',
          label: 'Så fungerar det',
          description: 'Se processen med privata trådar och AI-medling steg för steg.'
        },
        {
          href: '/who-its-for',
          label: 'Vem det är för',
          description: 'Ta reda på vilka typer av känsliga samtal som passar bäst.'
        },
        {
          href: '/',
          label: 'Prova själv',
          description: 'Begär en engångskod och utforska produkten direkt.'
        }
      ],
      ctaTitle: 'Se fördelarna i själva produkten',
      ctaBody:
        'På startsidan kan du begära åtkomst direkt och börja i ett medlat samtalsflöde.',
      ctaLabel: 'Gå till startsidan'
    },
    'who-its-for': {
      eyebrow: 'Vem det är för',
      title: 'Byggt för samtal som betyder för mycket för att lämnas åt rå meddelandeton ensam.',
      lead:
        'oliveaccord är till för människor som bryr sig om relationen eller utfallet, men som behöver hjälp att ta sig igenom nästa svåra utbyte utan att göra läget värre.',
      highlightsTitle: 'Vanliga användningsfall',
      highlights: [
        'Par eller tidigare partners som försöker dämpa ett laddat ämne.',
        'Familjemedlemmar som arbetar sig igenom sår, avstånd eller olika förväntningar.',
        'Vänner, personer som bor ihop eller medföräldrar som behöver prata om gränser eller gemensamma beslut.'
      ],
      sections: [
        {
          title: 'Par, partners och relationsreparation',
          body:
            'När en diskussion fastnar i försvar, tillbakadragande eller återkommande missförstånd kan oliveaccord fungera som en lugnare bro. Det gäller både pågående relationer och svåra samtal efteråt.',
          points: [
            'Reparation efter ett gräl eller ett tillitsbrott.',
            'Prata om ouppfyllda behov utan ännu en explosion.',
            'Arbeta mot ett gemensamt beslut med mindre hetta.'
          ]
        },
        {
          title: 'Familj och nära personliga relationer',
          body:
            'Några av de svåraste samtalen sker med människor som känner oss väl. Den historien gör formuleringar mer laddade, och det är just där ett privat medlingslager kan hjälpa.',
          points: [
            'Spänning mellan förälder och vuxet barn.',
            'Syskonkonflikter och gammal sårbarhet.',
            'Återkommande familjemönster som gång på gång saboterar direkta samtal.'
          ]
        },
        {
          title: 'Gränser, ursäkter och känsliga beslut',
          body:
            'oliveaccord passar när någon behöver säga något svårt tydligt, men vill ha större chans att bli hörd än vad ett rått textmeddelande brukar ge.',
          points: [
            'Sätta sundare gränser.',
            'Be om ursäkt utan att poängen försvinner i försvar.',
            'Hantera känslomässigt laddade praktiska beslut.'
          ]
        }
      ],
      faqEyebrow: 'Frågor',
      faqTitle: 'Är det här rätt format för ert samtal?',
      faq: [
        {
          question: 'Måste båda vara tekniska för att använda det?',
          answer:
            'Nej. Flödet är enkelt: en person startar, den andra går med via en länk och båda använder guidade privata trådar.'
        },
        {
          question: 'Kan det fungera när en person tvekar att prata alls?',
          answer:
            'Ofta är det just då struktur hjälper. Ett lugnare och mindre exponerat format kan göra det lättare att stanna kvar i samtalet.'
        },
        {
          question: 'Är detta också tänkt för arbetsplatskonflikter?',
          answer:
            'Den tydligaste träffen i dagens produkt är personliga relationer och känsliga en-till-en-samtal, men samma struktur kan vara hjälpsam överallt där lugnare förmedling spelar roll.'
        }
      ],
      relatedTitle: 'Utforska mer',
      relatedPages: [
        {
          href: '/how-it-works',
          label: 'Så fungerar det',
          description: 'Förstå systemet med privata trådar och Olive som mellanhand.'
        },
        {
          href: '/benefits',
          label: 'Fördelar',
          description: 'Läs de viktigaste skälen till att välja ett medlat flöde.'
        },
        {
          href: '/',
          label: 'Prova själv',
          description: 'Gå tillbaka till startsidan och begär din engångskod.'
        }
      ],
      ctaTitle: 'Se om arbetsflödet passar din situation',
      ctaBody:
        'Börja på startsidan, begär en kod och utforska det privata samtalsflödet direkt.',
      ctaLabel: 'Prova oliveaccord'
    }
  }
};

@Component({
  selector: 'app-marketing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <section class="space-y-6">
      <div class="glass-panel overflow-hidden rounded-[2.25rem] p-8 sm:p-10 lg:p-12">
        <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div class="space-y-5">
            <p class="m-0 text-sm uppercase tracking-[0.34em] text-[color:var(--accent-600)]">{{ page().eyebrow }}</p>
            <h1 class="m-0 max-w-4xl text-4xl font-semibold leading-tight text-[color:var(--text-strong)] sm:text-5xl">
              {{ page().title }}
            </h1>
            <p class="m-0 max-w-3xl text-base leading-7 text-[color:var(--text-muted)] sm:text-lg">
              {{ page().lead }}
            </p>
          </div>

          <aside class="rounded-[2rem] border border-[rgba(75,142,147,0.14)] bg-[linear-gradient(155deg,rgba(255,255,255,0.84),rgba(242,247,238,0.68))] p-6 shadow-[0_18px_48px_rgba(61,95,88,0.08)]">
            <p class="m-0 text-xs uppercase tracking-[0.28em] text-[color:var(--text-muted)]">{{ page().highlightsTitle }}</p>
            <div class="mt-5 space-y-3">
              @for (highlight of page().highlights; track highlight) {
                <div class="rounded-[1.35rem] border border-[rgba(132,157,112,0.14)] bg-white/70 px-4 py-3 text-sm leading-6 text-[color:var(--text-strong)]">
                  {{ highlight }}
                </div>
              }
            </div>
          </aside>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        @for (section of page().sections; track section.title) {
          <article class="glass-panel rounded-[2rem] p-6">
            <h2 class="m-0 text-2xl font-semibold text-[color:var(--text-strong)]">{{ section.title }}</h2>
            <p class="mt-4 text-sm leading-7 text-[color:var(--text-muted)]">{{ section.body }}</p>

            <div class="mt-5 space-y-3">
              @for (point of section.points; track point) {
                <div class="rounded-[1.35rem] bg-[rgba(248,250,246,0.92)] px-4 py-3 text-sm leading-6 text-[color:var(--text-strong)]">
                  {{ point }}
                </div>
              }
            </div>
          </article>
        }
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section class="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p class="m-0 text-sm uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{{ page().faqEyebrow }}</p>
          <h2 class="mt-3 text-3xl font-semibold text-[color:var(--text-strong)]">{{ page().faqTitle }}</h2>

          <div class="mt-6 space-y-4">
            @for (item of page().faq; track item.question) {
              <article class="rounded-[1.6rem] border border-[rgba(132,157,112,0.14)] bg-white/72 px-5 py-4">
                <h3 class="m-0 text-lg font-semibold text-[color:var(--text-strong)]">{{ item.question }}</h3>
                <p class="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{{ item.answer }}</p>
              </article>
            }
          </div>
        </section>

        <div class="space-y-6">
          <section class="glass-panel rounded-[2rem] p-6 sm:p-8">
            <p class="m-0 text-sm uppercase tracking-[0.32em] text-[color:var(--text-muted)]">{{ page().relatedTitle }}</p>
            <div class="mt-5 grid gap-4">
              @for (item of page().relatedPages; track item.href) {
                <a
                  [routerLink]="item.href"
                  class="block rounded-[1.6rem] border border-[rgba(75,142,147,0.14)] bg-white/76 px-5 py-4 text-inherit no-underline transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <h3 class="m-0 text-lg font-semibold text-[color:var(--text-strong)]">{{ item.label }}</h3>
                  <p class="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{{ item.description }}</p>
                </a>
              }
            </div>
          </section>

          <section class="glass-panel rounded-[2rem] p-6 sm:p-8">
            <h2 class="m-0 text-2xl font-semibold text-[color:var(--text-strong)]">{{ page().ctaTitle }}</h2>
            <p class="mt-3 text-sm leading-7 text-[color:var(--text-muted)]">{{ page().ctaBody }}</p>
            <p-button
              [label]="page().ctaLabel"
              routerLink="/"
              styleClass="!mt-5 !bg-[color:var(--surface-900)] !border-[color:var(--surface-900)]"
            />
          </section>
        </div>
      </div>
    </section>
  `
})
export class MarketingPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  protected readonly i18n = inject(I18nService);
  protected readonly pageId = computed(
    () => (this.routeData()['marketingPageId'] as MarketingPageId | undefined) ?? 'how-it-works'
  );
  protected readonly page = computed(
    () => marketingPageContentByLanguage[this.i18n.language()][this.pageId()]
  );
}
