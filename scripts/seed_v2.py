"""
Seed OpenProject backlog v2 for Reflecta.

Aligned to Fachkonzept-PDFs/HTMLs (Stand 2026-05-26):
- Frontend: Wireframes USR-00..08, D-00..09, ADM-00 (only concepts, no impl)
- Backend target: AWS Lambda + DynamoDB (Single-Table) + Cognito
- AI provider: generic abstraction; EU-model for Premium, US-model for Basic
- Monetization: Free vs Premium tier
  * Goals AI-Pickup: Premium only
  * AI Chat: Premium only
  * Reflection questions: Free <= 3 / entry, then Premium
  * Analytics: 30 days free, 90/365 + correlations Premium
- NoSQL is target architecture (not a migration ticket)

Run:
    OP_TOKEN=opapi-... uv run python scripts/seed_v2.py [--dry-run]
"""
from __future__ import annotations

import argparse
import os
import sys
import time
import requests

BASE = "http://54.154.135.39/api/v3"
TOKEN = os.environ.get("OP_TOKEN")
if not TOKEN:
    print("Set OP_TOKEN env var", file=sys.stderr)
    sys.exit(1)
AUTH = ("apikey", TOKEN)

PROJECT_ID = 4
TYPE_TASK = 1
TYPE_SUMMARY = 3
STATUS_NEW = 1
PRIO_NORMAL = 8
PRIO_HIGH = 9
SPRINT_VERSION_ID = 14  # "Sprint 1"

USER = {
    "Julian": 36,
    "Bilal": 40,
    "Finn": 39,
    "Chris": 38,
    "Tristan": 35,
    "Srisharanya": 34,
    "TobiasD": 18,
    "TobiasM": 17,
    "Simon": None,
    "Jan": None,
    "Daria": None,
    "Andrii": None,
}


def dod() -> str:
    return (
        "## Definition of Done\n"
        "- [ ] Implementation abgeschlossen\n"
        "- [ ] Unit/Component-Tests vorhanden und grün\n"
        "- [ ] Code Review (mind. 1 Approver) erfolgt\n"
        "- [ ] Acceptance Criteria nachweislich erfüllt\n"
        "- [ ] Linter/Formatter ohne Fehler\n"
        "- [ ] Doku im Fachkonzept / Confluence aktualisiert\n"
        "- [ ] In Staging deployed und Smoke-Test bestanden\n"
        "- [ ] Verantwortlicher Department-Lead Sign-Off\n"
        "- [ ] Mobile + Desktop verifiziert (falls UI)\n"
        "- [ ] WCAG 2.2 AA Check (falls UI)\n"
    )


def body(*, story: str, ac: list[str], notes: str, dept: str, owners: list[str], ref: str = "") -> str:
    ac_md = "\n".join(f"- [ ] {a}" for a in ac)
    s = f"**Department:** {dept}\n**Verantwortlich:** {', '.join(owners)}\n"
    if ref:
        s += f"**Referenz:** {ref}\n"
    s += f"\n## User Story\n{story}\n\n## Acceptance Criteria\n{ac_md}\n\n"
    if notes:
        s += f"## Technical Notes\n{notes}\n\n"
    s += dod()
    return s


def epic_body(*, dept: str, owners: list[str], goal: str, scope: str) -> str:
    return (
        f"**Department:** {dept}\n**Verantwortlich:** {', '.join(owners)}\n\n"
        f"## Ziel des Epics\n{goal}\n\n"
        f"## Umfasste Bereiche\n{scope}\n\n"
        "## Definition of Ready (für Sub-Tasks)\n"
        "- [ ] User Story klar formuliert\n"
        "- [ ] Acceptance Criteria definiert\n"
        "- [ ] Abhängigkeiten geklärt\n"
        "- [ ] Story Points geschätzt\n"
        "- [ ] Designs / Wireframes verlinkt\n\n"
        "## Definition of Done (Epic-Level)\n"
        "- [ ] Alle Sub-Tasks abgeschlossen\n"
        "- [ ] End-to-End-Smoke-Test gegen Staging grün\n"
        "- [ ] Department-Lead Sign-Off\n"
        "- [ ] Doku ins Confluence übernommen\n"
    )


# Globals for dry-run / live mode
DRY_RUN = False
NEXT_FAKE_ID = 100000
CREATED_COUNT = {"epics": 0, "tasks": 0}


def post_wp(payload: dict) -> dict:
    global NEXT_FAKE_ID
    if DRY_RUN:
        NEXT_FAKE_ID += 1
        return {"id": NEXT_FAKE_ID}
    r = requests.post(f"{BASE}/projects/{PROJECT_ID}/work_packages", auth=AUTH, json=payload, timeout=30)
    if r.status_code >= 400:
        print("ERROR", r.status_code, r.text[:600], file=sys.stderr)
        r.raise_for_status()
    return r.json()


def make_epic(*, subject: str, description: str, owner: str | None = None) -> int:
    p: dict = {
        "subject": subject,
        "description": {"format": "markdown", "raw": description},
        "_links": {
            "type": {"href": f"/api/v3/types/{TYPE_SUMMARY}"},
            "status": {"href": f"/api/v3/statuses/{STATUS_NEW}"},
            "priority": {"href": f"/api/v3/priorities/{PRIO_HIGH}"},
            "version": {"href": f"/api/v3/versions/{SPRINT_VERSION_ID}"},
        },
    }
    if owner and USER.get(owner):
        p["_links"]["assignee"] = {"href": f"/api/v3/users/{USER[owner]}"}
    res = post_wp(p)
    CREATED_COUNT["epics"] += 1
    print(f"  EPIC #{res['id']}: {subject}")
    return res["id"]


def make_task(*, parent: int, subject: str, raw: str, sp: int, assignee: str | None = None) -> int:
    p: dict = {
        "subject": subject,
        "description": {"format": "markdown", "raw": raw},
        "storyPoints": sp,
        "_links": {
            "type": {"href": f"/api/v3/types/{TYPE_TASK}"},
            "status": {"href": f"/api/v3/statuses/{STATUS_NEW}"},
            "priority": {"href": f"/api/v3/priorities/{PRIO_NORMAL}"},
            "parent": {"href": f"/api/v3/work_packages/{parent}"},
            "version": {"href": f"/api/v3/versions/{SPRINT_VERSION_ID}"},
        },
    }
    if assignee and USER.get(assignee):
        p["_links"]["assignee"] = {"href": f"/api/v3/users/{USER[assignee]}"}
    res = post_wp(p)
    CREATED_COUNT["tasks"] += 1
    print(f"    TASK #{res['id']}: {subject} (SP={sp})")
    if not DRY_RUN:
        time.sleep(0.05)
    return res["id"]


# ---------------------------------------------------------------------------
# Department definitions follow in separate functions per Epic
# ---------------------------------------------------------------------------


def epic_landingpage() -> None:
    eid = make_epic(
        subject="[EPIC] Frontend-Landingpage",
        owner="Chris",
        description=epic_body(
            dept="Frontend-Landingpage",
            owners=["Chris (5681102)"],
            goal=(
                "Öffentliche Marketing-Landingpage gemäß Fachkonzept (D-00..D-09) inklusive "
                "Pricing-Section, Cookie-Consent, SEO und Performance. Konvertiert Besucher zur Reflecta-App."
            ),
            scope=(
                "- Sticky Navigation, Hero, Metrics-Marquee, Feature-Sections, Reviews, Final-CTA, Footer\n"
                "- Auth-Dialog (Cognito + GitHub-OAuth), Mobile-Drawer\n"
                "- Pricing-Section (Free vs Premium, EU/US-AI-Region Hinweis)\n"
                "- DSGVO-Cookie-Banner, SEO/Meta, Performance, A/B-Test-Hooks\n"
                "- Demo-Account-Login mit 5-Min-Auto-Logout"
            ),
        ),
    )
    dept = "Frontend-Landingpage"
    own = ["Chris"]

    tasks = [
        ("[Landingpage] Projekt-Setup (React + Vite/Next, Tailwind, Plus Jakarta Sans)", 3,
         "Als Entwickler möchte ich ein sauberes Frontend-Setup, damit alle Sub-Stories darauf aufbauen.",
         ["Repository-Struktur für Landingpage angelegt",
          "Tailwind mit Brand-Tokens aus Style Guide konfiguriert",
          "Plus Jakarta Sans Self-Hosted (woff2) eingebunden",
          "ESLint + Prettier + Husky Pre-Commit eingerichtet",
          "CI Build läuft auf jedem PR"],
         "Brand-Tokens aus Reflecta_StyleGuide_Animatic.pdf übernehmen (Neural Excitation #9B30FF, Deep Synthesis #6A0DAD).",
         "D-00..D-09"),

        ("[Landingpage] D-00 Sticky Navigation + Anchor-Links + Hamburger-Toggle", 3,
         "Als Besucher möchte ich beim Scrollen jederzeit Navigation und CTA sehen, damit ich nie weit von der Conversion entfernt bin.",
         ["Sticky Top-Nav mit Logo, Anchor-Links (Features, Science, Reviews)",
          "Login-Button + primärer CTA 'Kostenlos starten'",
          "Hamburger-Toggle aktiviert sich unter 768px",
          "Soft-Scroll zu Anchor-Targets",
          "Aktive Sektion wird im Nav hervorgehoben"],
         "ScrollSpy via IntersectionObserver. Sticky via position:sticky / top:0.",
         "D-00"),

        ("[Landingpage] D-01 Hero 'Quantify your consciousness' + App-Shell-Mockup", 5,
         "Als Besucher möchte ich auf den ersten Blick verstehen was Reflecta ist und was ich bekomme, damit ich weiterscrolle oder direkt konvertiere.",
         ["Headline 'Quantify your consciousness' + Subheadline aus Marketing-Copy",
          "Zwei CTAs: 'Kostenlos starten' (primary), 'Demo testen' (secondary)",
          "App-Shell-Mockup als visueller Anker rechts/zentriert",
          "Fade-In-Animation beim ersten Sichtbarwerden (320ms ease-out)",
          "Mobile: CTAs gestapelt, Mockup darunter"],
         "Animation gem. Animatic-Definition (cubic-bezier(0.16,1,0.3,1)).",
         "D-01"),

        ("[Landingpage] D-02 Metrics-Marquee mit 5 KPI-Karten", 3,
         "Als Besucher möchte ich die Datendichte der App vorab sehen, damit ich ihren Wert quantifizieren kann.",
         ["5 KPI-Karten (Stress, Mood, Social, Sleep, AI Synthesis Accuracy)",
          "Auto-Scroll Marquee 30s pro Loop",
          "Pausiert bei Hover/Focus (a11y)",
          "Reduced-Motion-Support: kein Auto-Scroll bei prefers-reduced-motion"],
         "Werte aus Fachkonzept: Stress 3.1, Mood 3.6, Social 3.2, Sleep 4.1, Accuracy 98%.",
         "D-02"),

        ("[Landingpage] D-03 Feature-Section Journal mit Live-Mockup", 5,
         "Als Besucher möchte ich die Journal-Funktion live ausprobieren können, damit der KI-Wert direkt erlebbar ist.",
         ["Interaktiver Slider für Sentiment 1-5",
          "Texteingabefeld mit 1s Debounce",
          "Bei Tipp-Pause Demo-API ruft KI-Reflexionsfrage ab und zeigt sie an",
          "Loading-Skeleton während KI-Call",
          "Fallback bei API-Fehler (statisches Beispiel)"],
         "Demo-Endpoint: POST /demo/journal-question (rate-limited).",
         "D-03"),

        ("[Landingpage] D-04 Feature-Section Analytics mit Charts/Sleep-Ring", 5,
         "Als Besucher möchte ich das Analytics-Dashboard inkl. Trend-Charts vorab sehen, damit ich den langfristigen Nutzen verstehe.",
         ["Trend-Chart Mock (animierter SVG-Path mit stroke-dashoffset)",
          "KPI-Kacheln Mock (Streak, Avg Mood, Avg Sleep)",
          "Sleep-Ring SVG-Animation",
          "Hover/Tap auf Chart-Datenpunkte zeigt Wert-Tooltip (Animatic: 'Nutzer scrollt und kann real auf dem Graph Zahlen angezeigt sehen')",
          "Touch-fähiger Tooltip auf Mobile (Tap statt Hover)",
          "CTA 'Try Live Demo' am Ende der Section",
          "Lazy-Load via IntersectionObserver"],
         "Chart-Animation 900ms ease-out laut Animatic. Hover-Interaktivität referenziert Animatic-Transkript.",
         "D-04"),

        ("[Landingpage] D-05 Feature-Section Reflektor AI-Chatbot (Demo + Insights)", 3,
         "Als Besucher möchte ich sehen wie der Reflektor AI-Chatbot funktioniert und welche Insights er liefert, damit ich den Wert der Premium-Features verstehe.",
         ["Chat-Preview zeigt Beispiel-Nachrichten-Austausch zwischen User und Reflektor AI",
          "Insight-Karte rechts/darunter zeigt synthetisiertes Beispiel-Insight",
          "Chat-Preview mit typing-cursor Animation (0.9s loop)",
          "Hinweis: 'Premium Feature' mit Lock-Badge / Krone",
          "Mobile: Chat und Insights gestapelt"],
         "Premium-Markierung gem. Brand & Design (Krone/Lock). Section heißt im Animatic explizit 'Reflektor AI-Chatbot'.",
         "D-05"),

        ("[Landingpage] D-06 Reviews/Testimonials", 2,
         "Als Besucher möchte ich Erfahrungen anderer Nutzer lesen, damit ich Vertrauen aufbaue.",
         ["3 Testimonial-Karten mit 5-Sterne-Rating",
          "Zitat, Autor, Persona-Beschriftung",
          "Karten responsive: Slider unter 768px"],
         "Testimonial-Texte vom Marketing-Team einholen (Abhängigkeit zu MV-Tickets).",
         "D-06"),

        ("[Landingpage] D-07 Final-CTA-Block + Footer (Legal-Links)", 3,
         "Als Besucher möchte ich am Seitenende erneut zur App geleitet werden, damit ich auch nach dem Lesen konvertiere.",
         ["Final-CTA mit Markenzeichen + Headline + 2 CTAs",
          "Footer mit Impressum, Datenschutz, AGB, Kontakt",
          "Social-Links (LinkedIn, Instagram, GitHub)"],
         "Legal-Links müssen auf MDX-Pages /impressum, /datenschutz, /agb verlinken.",
         "D-07"),

        ("[Landingpage] D-08 Auth-Dialog (Cognito + GitHub-OAuth)", 8,
         "Als Besucher möchte ich mich per E-Mail oder GitHub einfach registrieren / anmelden, damit ich die App nutzen kann.",
         ["Tab-Switch Login/Signup",
          "E-Mail + Passwort Felder mit HTML5-Validierung",
          "GitHub-OAuth-Button mit Cognito Federated IdP",
          "Demo-Account-Button (vorbefüllte Seed-Daten, 5-Min-Session)",
          "Fehlerstates: ungültige Credentials, Rate-Limit, MFA-Schritt",
          "Erfolgreicher Login -> Redirect zu /app"],
         "Cognito User Pool + App Client + GitHub IdP siehe Backend Epic. Frontend nutzt amazon-cognito-identity-js oder Hosted UI.",
         "D-08"),

        ("[Landingpage] D-09 Mobile-Drawer-Navigation <768px", 3,
         "Als Mobile-Nutzer möchte ich eine zugängliche Menu-Navigation, damit alle Sektionen erreichbar bleiben.",
         ["Slide-Down-Drawer beim Hamburger-Klick",
          "Anchor-Links + Login + CTA im Drawer",
          "ESC schließt, Klick auf Backdrop schließt",
          "Body-Scroll-Lock bei offenem Drawer"],
         "Touch-Targets >=44x44px gem. Userforms-Spec.",
         "D-09"),

        ("[Landingpage] Pricing-Section (Free vs Premium, EU/US-Region)", 5,
         "Als Besucher möchte ich klar sehen was Free vs Premium bietet und wo meine Daten verarbeitet werden, damit ich eine informierte Kaufentscheidung treffe.",
         ["Zwei Tarif-Karten: Free, Premium (monatlich + jährlich)",
          "Feature-Matrix mit Haken/Lock-Icons",
          "Hinweis: Premium nutzt EU-AI-Modell, Free nutzt US-AI-Modell",
          "FAQ-Akkordeon mit DSGVO-/Daten-Fragen",
          "Aktiver Tarif via Annual-Toggle umstellbar"],
         "Pricing aus Business-Modell übernehmen: 4,99 EUR/Monat, 49 EUR/Jahr (Marketing-Studie kann dies aktualisieren).",
         ""),

        ("[Landingpage] Cookie-Consent-Banner DSGVO-konform", 3,
         "Als EU-Besucher möchte ich granular einwilligen können, damit DSGVO eingehalten wird.",
         ["Banner mit Akzeptieren-Alle / Nur-nötig / Einstellungen",
          "Granular: Funktional (always on), Analyse, Marketing",
          "Consent in localStorage + Backend-Endpoint persistiert",
          "Tracking-Skripte erst nach Consent geladen",
          "Re-Consent nach 12 Monaten"],
         "Backend-Endpoint POST /consent siehe Backend Epic. Banner-Design konsistent mit Brand & Design.",
         ""),

        ("[Landingpage] SEO-Setup (Meta, OG, sitemap, robots, schema.org)", 2,
         "Als Reflecta möchten wir organischen Traffic gewinnen, deshalb muss die Seite suchmaschinenfreundlich sein.",
         ["Meta-Title, Description, Canonical pro Sektion/Page",
          "OpenGraph + Twitter-Cards",
          "sitemap.xml + robots.txt",
          "JSON-LD schema.org SoftwareApplication + Organization",
          "hreflang für DE/EN falls relevant"],
         "Lighthouse SEO-Score >=95 als Akzeptanz-Hurde.",
         ""),

        ("[Landingpage] Analytics-Tracking (Conversion + Scroll-Tiefe) consent-gated", 3,
         "Als Marketing-Team möchte ich Conversion-Funnels und Scroll-Tiefe messen, damit ich die Seite optimieren kann.",
         ["Tracking-Provider (z.B. Plausible / GA4) integriert, erst bei Consent geladen",
          "Events: CTA-Klick, Demo-Start, Signup-Open, Signup-Submit",
          "Scroll-Tiefe in 25/50/75/100% Stufen",
          "Marketing-Team hat Zugriff auf Dashboards"],
         "Daten-Verantwortlicher für Consent-Vertrag mit Provider klären (Abhängigkeit zu BM-Epic).",
         ""),

        ("[Landingpage] Performance-Optimierung (LCP <2.5s, CLS <0.1)", 3,
         "Als Besucher möchte ich eine schnelle Seite, damit ich nicht abspringe.",
         ["Lazy-Loading aller Images mit loading=lazy + width/height",
          "WebP/AVIF-Bildformate",
          "Critical CSS inline, rest deferred",
          "Self-hosted Fonts mit font-display:swap",
          "Lighthouse Performance >=90 mobil"],
         "Performance-Budget in CI überwachen (z.B. lighthouse-ci).",
         ""),

        ("[Landingpage] Demo-Account mit 5-Min-Auto-Logout + Signup-Modal", 5,
         "Als Interessent möchte ich die App ohne Registrierung 5 Minuten testen, damit ich vor dem Signup überzeugt werde.",
         ["Demo-Login erstellt temporäre Session via Backend",
          "5-Min-Countdown im UI sichtbar",
          "Nach Ablauf: Signup-Modal mit 'Daten retten - jetzt registrieren'",
          "Demo-Daten werden seriell via Seed-Script bereitgestellt",
          "Demo-User können keine echten Stripe-Aktionen auslösen"],
         "Backend-Endpoint POST /auth/demo-session siehe Backend-Epic.",
         ""),

        ("[Landingpage] Mobile-Hardening 360-768px aller Sections", 3,
         "Als Mobile-User möchte ich auf allen gängigen Geräten ein perfektes Layout, damit nichts abgeschnitten ist.",
         ["Tests auf 360, 390, 414, 768 px Viewport",
          "Touch-Targets >=44x44px",
          "Keine horizontalen Scrolls",
          "Modal-Layout füllt Viewport ab <768"],
         "Visuelle Regression via Playwright Screenshots in CI.",
         ""),

        ("[Landingpage] Legal-Pages /impressum /datenschutz /agb (MDX)", 3,
         "Als Reflecta-Betreiber müssen wir gesetzlich Pflichtinformationen anbieten, damit wir DSGVO + TMG erfüllen.",
         ["Impressum mit Anschrift, Vertretungsberechtigtem, Kontakt",
          "Datenschutzerklärung inkl. Hinweis US-AI-Verarbeitung (Art. 49 DSGVO)",
          "AGB mit Widerrufsbelehrung für Premium-Abo",
          "Texte aus BM-Epic kommen als Input"],
         "Texte werden vom Business-Modell-Team geliefert; Frontend rendert MDX.",
         ""),

        ("[Landingpage] A/B-Test-Hooks für Hero-Copy + CTA", 2,
         "Als Marketing-Team möchte ich verschiedene Headlines/CTA-Texte testen, damit ich die Conversion-Rate optimiere.",
         ["Feature-Flag-System eingebunden (z.B. GrowthBook / eigene API)",
          "Mind. 2 Hero-Varianten konfigurierbar",
          "Tracking trennt Varianten nach Cookie-ID",
          "Marketing dokumentiert Test-Hypothesen"],
         "Abhängigkeit: Backend liefert Feature-Flag-Endpoint.",
         ""),
    ]

    for subj, sp, story, ac, notes, ref in tasks:
        make_task(
            parent=eid,
            subject=subj,
            sp=sp,
            assignee="Chris",
            raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref),
        )


def epic_userforms() -> None:
    eid = make_epic(
        subject="[EPIC] Frontend-Userforms",
        owner="Julian",
        description=epic_body(
            dept="Frontend-Userforms",
            owners=["Julian (2990570)"],
            goal=(
                "Eingeloggte Web-/Mobile-Anwendung mit allen Nutzer-Flows: Journal, Goals, Calendar, "
                "Analytics, Account-Settings. Premium-Paywalls und Quotas eingebaut. PWA-fähig."
            ),
            scope=(
                "- App-Shell (USR-00) mit Sidebar/Mobile-Hamburger\n"
                "- Journal-Liste/Detail/Form (USR-01..03) mit KI-Reflexion\n"
                "- Goals-Liste/Detail/Form (USR-04..06) mit KI-Empfehlung + Verfeinerung\n"
                "- Kalender (USR-07)\n"
                "- Analytics-Dashboard (USR-08)\n"
                "- Premium-Paywalls (Goals AI-Pickup, Chat, Analytics 90/365, 3 Reflexionen Free)\n"
                "- Account-Settings (Sub-Status, AI-Region, Datenexport, Löschung)\n"
                "- WCAG 2.2 AA, Mobile 360-768, PWA"
            ),
        ),
    )
    dept = "Frontend-Userforms"
    own = ["Julian"]

    tasks = [
        ("[Userforms] Projekt-Setup (React, TanStack Query, Tailwind, Cognito-SDK)", 5,
         "Als Entwickler möchte ich ein Userforms-Projekt mit Auth-Layer, damit alle Stories darauf aufbauen.",
         ["React App initialisiert, geteiltes Theme mit Landingpage",
          "TanStack Query für Server-State eingebunden",
          "Cognito-SDK + Token-Refresh-Logic integriert",
          "API-Client mit Auth-Interceptor (Bearer-JWT)",
          "Routing für alle USR-Screens skizziert"],
         "Token-Storage: HttpOnly-Cookie via BFF oder secure storage. Mit Backend-Team abstimmen.",
         "USR-00..08"),

        ("[Userforms] USR-00 App-Shell (Sidebar 4-Tabs + Header + Mobile-Hamburger)", 5,
         "Als eingeloggter Nutzer möchte ich eine konsistente Navigation, damit ich alle Bereiche schnell erreiche.",
         ["Sidebar mit Tabs Journal, Ziele, Kalender, Analytics",
          "Header zeigt Username + heutiges Datum + Logout",
          "Premium-Badge (Krone) sichtbar wenn user.tier=premium",
          "Mobile <768px: Hamburger-Drawer + Bottom-Nav-Optionen",
          "Aktiver Tab ist visuell hervorgehoben",
          "Tastatur-Navigation: Tab + Pfeiltasten"],
         "Brand: Active-State nutzt Neural Excitation #9B30FF.",
         "USR-00"),

        ("[Userforms] USR-01 Journal-Übersicht mit Filterleiste", 5,
         "Als Nutzer möchte ich meine Einträge als Liste sehen und filtern, damit ich alte Reflexionen wiederfinde.",
         ["Liste paginiert (20/Page) sortiert DESC nach date",
          "Filter: Volltext-Suche, Datumsbereich, Aktivitäten, Sentiments",
          "Empty-State + Loading-Skeleton + Error-State",
          "Klick auf Eintrag öffnet USR-02 Modal",
          "FAB '+' öffnet USR-03 Form-Modal",
          "Mobile: Filterleiste in Drawer"],
         "Pagination via cursor-based Query (DynamoDB LastEvaluatedKey).",
         "USR-01"),

        ("[Userforms] USR-02 Entry-Detail-Modal Read-Only", 3,
         "Als Nutzer möchte ich einen Eintrag im Detail lesen, damit ich Erkenntnisse rekapituliere.",
         ["Zeigt title, date, content (formatted_content falls vorhanden)",
          "Aktivitäts- und Sentiment-Tags angezeigt",
          "Verknüpfte Goals als Chips",
          "Schließen via X / ESC / Backdrop",
          "Edit-Button öffnet USR-03 im Edit-Mode",
          "Read-Only für Demo-Account"],
         "Tags farbcodiert gem. Emotive Lexicon (Brand & Design).",
         "USR-02"),

        ("[Userforms] USR-03 Entry-Form-Modal (Slider + KI-Toggle + Reflexionsfrage)", 8,
         "Als Nutzer möchte ich tagesaktuell Eintrage erfassen und KI-gestützt reflektieren, damit ich tiefer in mich hineinblicke.",
         ["Pflichtfelder title, date, content",
          "4 Slider 1-5 (sentiment, sleep, stress, social) mit aria-valuetext",
          "KI-Toggle aktiviert Reflexionsfragen-Generierung",
          "Bei Tipp-Pause >1s ruft KI-Endpoint auf, zeigt Frage darunter",
          "Free-Tier zeigt Counter '2/3 Reflexionen genutzt' und sperrt nach 3",
          "Optimistic UI: Eintrag erscheint sofort in Liste",
          "Validierungsfehler werden inline angezeigt"],
         "Endpoint: POST /ai/journal-question mit Quota-Header X-Quota-Remaining.",
         "USR-03"),

        ("[Userforms] USR-04 Goals-Übersicht + KI-Empfehlungs-Karussell", 5,
         "Als Nutzer möchte ich meine Ziele und KI-Vorschläge sehen, damit ich Inspiration für neue Ziele bekomme.",
         ["Goals-Liste sortiert nach Priorität, mit Progress-Bar",
          "3 KI-Empfehlungs-Karten oben",
          "Button 'Empfehlung neu generieren'",
          "Premium-Lock: Klick auf 'Übernehmen' bei Free zeigt Upsell-Modal",
          "Empty-State + Loading + Error",
          "Mobile: Karussell swipebar"],
         "Endpoint: POST /goals/recommend (premium-required für Pickup).",
         "USR-04"),

        ("[Userforms] USR-05 Goal-Detail-Modal mit Progress-Bar", 3,
         "Als Nutzer möchte ich Detailinformationen zu einem Ziel sehen, damit ich Fortschritt verstehe.",
         ["Zeigt title, type, category, priority, description, target_date, progress (0-100)",
          "Letzte 5 verknüpfte Einträge als Liste",
          "Edit-Button öffnet USR-06",
          "Delete-Button mit Bestätigung"],
         "Eintrags-Liste über DynamoDB Goal->Entry Reverse-Index.",
         "USR-05"),

        ("[Userforms] USR-06 Goal-Form-Modal mit KI-Verfeinerung", 5,
         "Als Nutzer möchte ich beim Erstellen meines Ziels eine KI-Verfeinerung der Beschreibung erhalten, damit das Ziel klarer wird.",
         ["Pflichtfelder: title, type (Recurring/One-time), category, priority",
          "Optional: description, target_date",
          "Button 'KI-Verfeinerung' ruft enhance-description-Endpoint",
          "Vorschau zeigt umformulierten Text mit Übernehmen / Verwerfen",
          "Validierung: progress 0-100, target_date >= heute",
          "Fehler-State bei API-Ausfall mit Retry-Button"],
         "Endpoint: POST /goals/enhance-description.",
         "USR-06"),

        ("[Userforms] USR-07 Kalender Monatsmatrix + Tagesdetail-Panel", 5,
         "Als Nutzer möchte ich meine Eintrage in Kalenderansicht sehen, damit ich Muster über Wochen erkenne.",
         ["Monatsmatrix mit Tageszelle (Punkt für Eintrag, Farbe nach Sentiment)",
          "Klick auf Tag öffnet Detail-Panel rechts/unten",
          "Panel zeigt Einträge des Tages + Goals + Quick-Action 'Eintrag erstellen'",
          "Vor/Zurück-Navigation Pfeile + Heute-Button",
          "Mobile: Panel als Bottom-Sheet"],
         "Sentiment-Farben aus Emotive Lexicon (Brand & Design).",
         "USR-07"),

        ("[Userforms] USR-08 Analytics-Dashboard (Toggle 7/30/90/365 + Charts + KI-Frage)", 8,
         "Als Nutzer möchte ich mein Wohlbefinden im Zeitverlauf analysieren, damit ich Trends erkenne und reagieren kann.",
         ["Toggle 7/30/90/365 Tage",
          "Summary-Kacheln: Streak, Avg Mood, Avg Sleep, Avg Stress, Avg Social",
          "Sentiment-Verlauf Line-Chart (animated)",
          "Sleep-Sentiment Korrelation Scatter/Chart",
          "Top-Aktivitäten Bar-Chart",
          "KI-Reflexionsfrage am Ende (premium-only)",
          "Free-Tier: 90/365-Tabs gelockt, Korrelationen gelockt, 30 Tage frei"],
         "Endpoint: GET /analytics/* mit period-Param + Tier-Check.",
         "USR-08"),

        ("[Userforms] Paywall: Goals-AI-Pickup nur Premium", 3,
         "Als Free-Nutzer möchte ich klar erkennen welche KI-Goal-Funktionen Premium sind, damit ich gezielt upgraden kann.",
         ["Bei Free: Lock-Icon über 'Übernehmen' Button",
          "Klick triggert Upsell-Modal mit Pricing + 'Jetzt upgraden'",
          "Premium: Funktion direkt verfügbar",
          "A/B-fähig: 2 Upsell-Modal-Varianten via Feature-Flag"],
         "Frontend liest user.tier; Backend enforced zusätzlich.",
         ""),

        ("[Userforms] Paywall: KI-Chat komplett Premium-gated", 2,
         "Als Free-Nutzer möchte ich verstehen dass der KI-Chat Premium ist, damit Upgrades attraktiv erscheinen.",
         ["Chat-Tab ist Free sichtbar aber gelocked",
          "Erste Nachricht zeigt Lock-Screen mit Upsell-CTA",
          "Premium-User können normal chatten",
          "Empty-State bei Premium ohne History: Begrüßungsnachricht"],
         "",
         ""),

        ("[Userforms] Paywall: Analytics 30 Tage Free / 90+365 + Korrelationen Premium", 3,
         "Als Free-Nutzer möchte ich grundlegende Analytics nutzen können aber den Premium-Tiefgang sehen, damit ich konvertiere.",
         ["7/30-Tage-Tabs frei nutzbar",
          "90/365-Tabs zeigen Lock-Overlay mit Upsell",
          "Korrelations-Block bei Free verschwommen + Lock",
          "Premium voll zugänglich"],
         "",
         ""),

        ("[Userforms] Paywall: 3 Reflexionsfragen / Entry Free, danach Lock", 3,
         "Als Free-Nutzer möchte ich 3 Reflexionsfragen pro Entry haben und danach einen klaren Hinweis aufs Upgrade, damit ich den Wert spüre.",
         ["Counter im UI 'X/3 genutzt'",
          "Backend liefert X-Quota-Remaining + 429 bei Limit",
          "Bei 0 verbleibend: Lock-State + Upsell-CTA",
          "Premium: kein Counter, unbegrenzt"],
         "Quota wird pro Entry gezählt, nicht pro Tag.",
         ""),

        ("[Userforms] Mobile-Layout 360-768 (Touch-Targets, Slider, Drawer)", 5,
         "Als Mobile-Nutzer möchte ich die App komfortabel bedienen können, damit Reflexion unterwegs möglich ist.",
         ["Touch-Targets >=44x44px",
          "Slider-Griff 24px Durchmesser",
          "Modale formatfüllend ab <=480px",
          "FAB im Bottom-Right erreichbar",
          "Filterleiste als Drawer",
          "Tablet 768-1024 als Zwischenstufe getestet"],
         "Visuelle Regression Tests via Playwright.",
         ""),

        ("[Userforms] Accessibility WCAG 2.2 AA Audit", 5,
         "Als Nutzer mit Behinderung möchte ich die App barrierefrei nutzen können, damit niemand ausgeschlossen wird.",
         ["Tab-Reihenfolge logisch, Esc schließt Modale",
          "Sichtbare Fokusringe 2px, 3:1 Kontrast",
          "ARIA-Labels: aria-label, aria-valuetext, aria-live",
          "Kontrast Body-Text >=4.5:1, UI >=3:1",
          "Screen-Reader-Test mit VoiceOver + NVDA",
          "prefers-reduced-motion respektiert"],
         "Externer Audit oder axe-core in CI.",
         ""),

        ("[Userforms] Empty/Loading/Error States für alle 8 Screens", 3,
         "Als Nutzer möchte ich verständliche Zustands-Hinweise sehen, damit Unklarheit vermieden wird.",
         ["Empty-State mit Illustration + CTA pro Screen",
          "Skeleton-Loader bei initialem Laden",
          "Error-Boundaries pro Route mit Retry-Button",
          "Offline-Indikator bei Netzwerkverlust"],
         "Empty-Illustrations werden vom Brand-Team geliefert.",
         ""),

        ("[Userforms] Account-Settings (Sub-Status, AI-Region, Datenexport, Löschen)", 5,
         "Als Nutzer möchte ich meine Account-Daten verwalten, damit ich Kontrolle über meine Daten habe.",
         ["Subscription-Status anzeigen + Stripe-Customer-Portal Link",
          "AI-Region wählbar (EU/US bei Premium, US-Only bei Free)",
          "Datenexport: 'Meine Daten als JSON herunterladen' (Async-Job, Mail-Link)",
          "Account-Löschung mit 2-stufiger Bestätigung + 14-Tage-Soft-Delete",
          "Passwort ändern (Cognito Hosted UI Redirect)",
          "Sprache (DE/EN) wählbar"],
         "Endpoints: GET /me/export (async), DELETE /me/account siehe Backend.",
         ""),

        ("[Userforms] Onboarding-Flow nach Signup (Persona-Fragen + erste Goals)", 5,
         "Als neuer Nutzer möchte ich beim ersten Start angeleitet werden, damit ich die App schnell verstehe und bleibe.",
         ["3-Schritt-Flow: Vorstellung, Persona-Fragen, erstes Goal",
          "Optionaler Skip-Button",
          "Bei Abschluss werden Demo-Insights angezeigt",
          "Wird nur einmal pro User getriggert (flag in Account)"],
         "Persona-Daten fliessen ins Marketing-KPI-Tracking.",
         ""),

        ("[Userforms] PWA-Setup (Manifest, Service Worker, Install-Prompt, Offline-Read)", 5,
         "Als Nutzer möchte ich Reflecta wie eine native App installieren, damit Reflexion einfach im Alltag bleibt.",
         ["manifest.webmanifest mit Icons (192, 512, maskable)",
          "Service Worker via Workbox: stale-while-revalidate für GET /journal/entries",
          "Offline-Read: zuletzt geladene Einträge lesbar",
          "Install-Prompt-UI mit dismissable State",
          "Lighthouse PWA-Score >=90"],
         "Push-Subscriptions im nächsten Ticket.",
         ""),

        ("[Userforms] Push-Notifications (Daily Reminder, opt-in)", 3,
         "Als Nutzer möchte ich optionale Erinnerungen zum Eintragen erhalten, damit ich kontinuierlich journale.",
         ["Opt-In-UI in Account-Settings",
          "Web-Push-Subscription registriert via VAPID",
          "Backend speichert subscription pro user",
          "Daily-Job sendet Reminder zur konfigurierten Zeit",
          "Unsubscribe-Flow vollständig"],
         "Backend-Lambda 'reminder-dispatcher' siehe Backend-Epic.",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Julian",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_adminforms() -> None:
    eid = make_epic(
        subject="[EPIC] Frontend-Adminforms",
        owner="Finn",
        description=epic_body(
            dept="Frontend-Adminforms",
            owners=["Finn (8533720)"],
            goal=(
                "Admin-Konsole gemäß ADM-00 (Stats-Dashboard) plus alle für eine fertige App nötigen "
                "Admin-Funktionen: User-Mgmt, Subscription-Mgmt, AI-Provider-Routing, Content-Moderation, "
                "DSGVO-Tooling, Feature-Flags."
            ),
            scope=(
                "- ADM-00 Stats-Dashboard (4 StatCards + AI Usage Card)\n"
                "- User-Mgmt (Suche, Ban, Rolle, Löschung)\n"
                "- Subscription-Mgmt (manuelles Up-/Downgrade, Refunds)\n"
                "- AI-Provider-Routing-Config (EU/US, Quotas)\n"
                "- Content-Moderation-Queue\n"
                "- DSGVO-Tooling (Export, Löschungs-Bestätigung, Audit-Log)\n"
                "- Feature-Flags-UI"
            ),
        ),
    )
    dept = "Frontend-Adminforms"
    own = ["Finn"]

    tasks = [
        ("[Admin] Projekt-Setup + Admin-Auth-Guard (is_admin Flag)", 3,
         "Als Reflecta-Betreiber möchte ich sicherstellen dass Admin-Routes nur für Admin-Accounts erreichbar sind, damit Datensicherheit gewährleistet ist.",
         ["Admin-Bundle baut separat (Code-Splitting)",
          "Auth-Guard prüft is_admin, redirect bei Verstoss",
          "Audit-Trail loggt jeden Admin-Page-Zugriff",
          "403-Page für nicht-Admin"],
         "Backend prüft zusätzlich auf jedem Endpoint via Cognito-Group oder is_admin DB-Flag.",
         "ADM-00"),

        ("[Admin] ADM-00 Stats-Dashboard (4 StatCards + AI Usage Card)", 5,
         "Als Admin möchte ich einen Live-Überblick über Plattform-KPIs, damit ich Trends erkenne.",
         ["StatCards: Total Users, Active 7d, Total Entries, AI Calls Today (laut Animatic)",
          "AI Usage Card: Total Calls, Success Rate, Total Tokens (Animatic: 'AI ist größter Kostentreiber')",
          "Keine Einsicht in einzelne Tagebücher (Datenschutz - laut Animatic explizit)",
          "Auto-Refresh alle 60s",
          "Mobile-Layout: Cards stacked"],
         "Endpoint: GET /admin/stats (Backend-Epic). Subscription-/Profit-Metriken siehe nächstes Ticket.",
         "ADM-00"),

        ("[Admin] ADM-00 Erweiterung: Subscription-Metriken, Conversion, Profit & Pricing-Control", 8,
         "Als Admin möchte ich Premium-/Free-Anteile, Conversion-Rate, Kosten/Profit und den Abo-Preis steuern können, damit ich das Geschäftsmodell live nachvollziehen und justieren kann (Animatic: 'Conversion-Rate, wie viel Nutzer auf Paid- vs Free-Plan, solche Sachen').",
         ["StatCard: Premium-User-Count (absolut + % Anteil)",
          "StatCard: Free-User-Count",
          "StatCard: Conversion-Rate Free->Premium (rolling 30d)",
          "StatCard: MRR (monthly recurring revenue) aus Stripe",
          "StatCard: AI-Cost-Burn (laufende Monatskosten EU- + US-Provider, aus AILOG-Items)",
          "StatCard: Profit = MRR - AI-Cost - Fixkosten (Fixkosten konfigurierbar)",
          "Trend-Chart: Premium-User + MRR über 90 Tage",
          "Pricing-Control: Eingabefeld monatlicher Preis + Annual-Discount %",
          "Pricing-Änderung erfordert Bestätigungs-Modal (Auswirkung auf Neu-Abos)",
          "Pricing-Änderung erzeugt Audit-Log-Eintrag (actor, old, new, timestamp)",
          "Pricing-Änderung synct via Stripe-API neue Price-Objects (alte bleiben für Bestandskunden)",
          "Mobile-Layout: Cards stacked, Pricing-Control als Bottom-Sheet"],
         "Backend: GET /admin/business-metrics + PUT /admin/pricing (siehe Backend-Epic). Bezieht Daten aus DynamoDB User-Items (tier), Stripe-API (MRR), AILOG-Items (Kosten).",
         "ADM-00 (Erweiterung gem. Animatic-Transkript)"),

        ("[Admin] User-Management Tabelle (Suche, Filter, Pagination)", 8,
         "Als Admin möchte ich Nutzer durchsuchen und filtern können, damit ich Support- und Compliance-Anliegen schnell löse.",
         ["Tabelle mit ID, E-Mail, tier, created_at, last_active",
          "Volltext-Suche (E-Mail, sub)",
          "Filter: tier, status (active/banned/deleted)",
          "Pagination 50/Seite via DynamoDB cursor",
          "Detail-Drawer mit Aktivitätshistorie",
          "Mobile: Cards statt Tabelle"],
         "Backend: GET /admin/users mit Cursor.",
         ""),

        ("[Admin] User-Aktionen (Ban/Unban, Rolle, Passwort-Reset, Löschen)", 5,
         "Als Admin möchte ich User-Aktionen ausführen, damit ich auf Vorfälle reagieren kann.",
         ["Ban / Unban User mit Begründungsfeld",
          "Rolle ändern (User <-> Admin) mit Bestätigung",
          "Passwort-Reset triggern (Cognito-API)",
          "Account löschen (Soft-Delete, 14 Tage Reversible)",
          "Aktionen werden im Audit-Log erfasst"],
         "Backend: PATCH /admin/users/{id}, DELETE /admin/users/{id}.",
         ""),

        ("[Admin] Subscription-Management (Liste, manuell Up-/Downgrade, Refunds)", 5,
         "Als Admin möchte ich Abos einsehen und manuell anpassen können, damit ich Support-Fälle abwickle.",
         ["Liste aller Subscriptions mit Status (active/canceled/past_due)",
          "Manuelles Upgrade/Downgrade via Stripe-API",
          "Refund-Button mit Begründung",
          "Coupon-Codes generieren / verwalten",
          "Sync-Status mit Stripe sichtbar"],
         "Backend: /admin/subscriptions/* siehe Backend-Epic + Stripe-Integration.",
         ""),

        ("[Admin] AI-Provider-Routing-Config (EU/US-Modell, Quotas)", 5,
         "Als Admin möchte ich AI-Provider und Quotas konfigurieren, damit Kosten/Compliance steuerbar bleiben.",
         ["UI zum Setzen Default-Provider Free=US, Premium=EU",
          "Pro-Feature Override (z.B. Chat=EU bei Premium-DE)",
          "Quotas: max Tokens/User/Tag",
          "Live-Preview der Konfig",
          "Änderungen erzeugen Audit-Eintrag"],
         "Backend speichert Config in DynamoDB-Item PK=CONFIG SK=AI_ROUTING.",
         ""),

        ("[Admin] Content-Moderation-Queue (gemeldete Einträge/Goals)", 3,
         "Als Admin möchte ich gemeldete Inhalte prüfen und Aktionen auslösen, damit Plattform-Sicherheit gewährleistet bleibt.",
         ["Queue zeigt offene Reports sortiert nach Datum",
          "Detail-Ansicht zeigt Inhalt + Reportgrund + Reporter",
          "Aktionen: Verwerfen, User warnen, Inhalt entfernen, User bannen",
          "Status nach Aktion gesetzt"],
         "Reporting-API muss vom Userforms-Frontend hinzugefügt werden (separates Ticket dort).",
         ""),

        ("[Admin] DSGVO-Tooling (Export-Trigger, Löschung, Audit-Log)", 5,
         "Als Admin möchte ich DSGVO-Anfragen abwickeln können, damit gesetzliche Fristen eingehalten werden.",
         ["Manueller Export-Trigger für beliebigen User (Async-Job)",
          "Löschung mit Bestätigung + Logging",
          "Audit-Log mit Filter (User, Aktion, Zeitraum)",
          "DSAR-Statistik (Anfragen offen / abgeschlossen / Fristen)"],
         "Backend: GET /admin/dsar, POST /admin/dsar/export, DELETE /admin/dsar/account.",
         ""),

        ("[Admin] Feature-Flags UI (Cohort-basierte Aktivierung)", 3,
         "Als Admin möchte ich Features pro Cohort toggeln, damit Rollouts sicher steuerbar sind.",
         ["Liste aller Flags mit Status (on/off/cohort)",
          "Cohort-Definition (z.B. tier=premium, country=DE, user-IDs)",
          "Änderung loggt User + Timestamp",
          "Rollback per Klick"],
         "Backend: /admin/feature-flags speichert in DynamoDB.",
         ""),

        ("[Admin] Mobile/Tablet-Layout (Tabellen scrollbar / Cards <=768)", 3,
         "Als Admin im Notfall mobil möchte ich die Konsole nutzen können, damit ich orts-unabhängig reagiere.",
         ["Tabellen mit horizontalem Scroll <=1024",
          "Card-Layout für User-/Subscription-Listen <=768",
          "Touch-Targets 44x44 für alle Aktionen",
          "Drawer-Navigation"],
         "",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Finn",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_backend_app() -> None:
    eid = make_epic(
        subject="[EPIC] Backend-ApplicationServer",
        owner="Bilal",
        description=epic_body(
            dept="Backend-ApplicationServer",
            owners=["Bilal (9333793)", "Simon (4898928)"],
            goal=(
                "Vollständige API als AWS Lambda + API Gateway, JWT-Auth via Cognito, "
                "AI-Provider-Abstraktion (EU/US-Routing nach Tier), Stripe-Monetarisierung, "
                "Quota-Enforcement, DSGVO-Endpoints, Observability."
            ),
            scope=(
                "- AWS-/IAM-/IaC-Setup\n"
                "- Lambda-Boilerplate + API Gateway + Cognito Authorizer\n"
                "- Domain-Endpoints: Journal, Goals, Analytics, Chat, Reflexion, Admin\n"
                "- AI-Abstraction (EU + US adapter), Secrets Manager\n"
                "- Stripe-Integration + Webhooks\n"
                "- Quota-Enforcement (Reflexion Free=3, Premium-only Endpoints)\n"
                "- DSGVO-Endpoints, Consent-Storage\n"
                "- CI/CD, Monitoring, WAF, Tests"
            ),
        ),
    )
    dept = "Backend-ApplicationServer"
    own = ["Bilal", "Simon"]

    tasks = [
        ("[Backend] AWS Account/Org Setup + IAM Baseline + Regions", 3,
         "Als Team möchten wir saubere AWS-Trennung Dev/Prod, damit kein Risiko entsteht.",
         ["AWS Org mit Accounts dev, staging, prod",
          "IAM-Baseline: kein Root-Use, MFA enforced, Admin-Group",
          "Region eu-central-1 als Default für EU-Daten",
          "Cost-Alarm bei Budget-Schwelle"],
         "OU-Strategie + SCP für Sicherheit. Bilal verantwortlich für Initial-Setup.",
         ""),

        ("[Backend] IaC mit AWS CDK (oder SAM) initialisieren", 5,
         "Als Team möchten wir Infrastruktur als Code, damit Deploys reproduzierbar sind.",
         ["Repo backend/ mit CDK-Projekt (TypeScript oder Python)",
          "Stacks: VpcStack (falls nötig), AuthStack, ApiStack, DataStack",
          "GitHub Actions Workflow 'cdk deploy' für dev/staging/prod",
          "cdk diff/synth in PRs als Comment"],
         "Alternativ AWS SAM falls Team SAM bevorzugt.",
         ""),

        ("[Backend] Lambda-Boilerplate Python (Layers, Logging, Error-Handler)", 5,
         "Als Entwickler möchte ich eine wiederverwendbare Lambda-Vorlage, damit alle Handler konsistent sind.",
         ["Lambda Layer mit boto3 + shared utils (auth, logging, errors)",
          "Strukturiertes Logging (JSON, request-id, user-sub)",
          "Generischer Error-Handler -> einheitliche Response (RFC7807)",
          "Pydantic-V2 Validierung für Inputs",
          "powertools-for-aws-lambda integriert"],
         "",
         ""),

        ("[Backend] API Gateway Setup + Routes + JWT-Authorizer", 5,
         "Als Team möchten wir einen zentralen API-Eingang mit Auth, damit Endpoints sicher sind.",
         ["HTTP API Gateway (cheaper than REST)",
          "Cognito JWT Authorizer attached an alle geschützten Routes",
          "CORS-Konfig für Landingpage + Userforms-Domain",
          "Routes mapped zu Lambda-Functions",
          "Stages dev/staging/prod"],
         "Custom Domain api.reflecta.app via ACM-Cert + R53.",
         ""),

        ("[Backend] Cognito User Pool + App Client + GitHub IdP-Federation", 5,
         "Als Nutzer möchte ich mich per E-Mail oder GitHub registrieren, damit Onboarding niedrigschwellig ist.",
         ["User Pool mit Email-Login, MFA optional",
          "App Client für Web (PKCE)",
          "GitHub als externer IdP konfiguriert",
          "Hosted UI mit Brand-Anpassung",
          "post-confirmation Lambda-Trigger für User-Provisioning in DynamoDB"],
         "JWKS-Endpoint wird vom Authorizer genutzt.",
         ""),

        ("[Backend] Journal-Endpoints CRUD (POST/GET/PATCH/DELETE /journal/entries)", 5,
         "Als Nutzer möchte ich CRUD auf meinen Einträgen, damit ich meine Daten verwalte.",
         ["POST /journal/entries (sync write + async enrich Trigger)",
          "GET /journal/entries paginiert via cursor (LSI1 by date)",
          "GET /journal/entries/{id}",
          "PATCH /journal/entries/{id} mit re-enrich bei content-Change",
          "DELETE /journal/entries/{id} kaskadiert Goal-Links",
          "Mandantentrennung: jeder Lookup filtert auf user_sub"],
         "Async enrich via SQS / EventBridge -> separater Lambda.",
         ""),

        ("[Backend] Goals-Endpoints CRUD (POST/GET/PATCH/DELETE /goals)", 5,
         "Als Nutzer möchte ich Ziele verwalten können, damit ich Fortschritt nachvollziehe.",
         ["CRUD-Endpoints äquivalent zu Journal",
          "GET /goals sortiert nach priority",
          "GET /goals/{id} mit max 5 verknüpften Einträgen",
          "Validierung: progress 0-100, priority Enum"],
         "",
         ""),

        ("[Backend] AI-Reflexionsfragen-Lambda + Quota-Check (3/Entry Free)", 5,
         "Als Nutzer möchte ich pro Eintrag Reflexionsfragen bekommen, damit Reflexion tiefer wird; Free hat 3, Premium unbegrenzt.",
         ["POST /ai/journal-question (entry_id, content)",
          "Quota: Free 3/Entry (counted via DynamoDB QUOTA-Item)",
          "Bei 0 verbleibend: 429 + X-Quota-Remaining=0",
          "Premium: keine Quota",
          "Response enthält question + remaining"],
         "Quota-Reset bei Löschung des Entry. Counter persistiert pro entry_id.",
         ""),

        ("[Backend] Entry-Anreicherungs-Lambda (Activities + Sentiments + Goals concurrent)", 5,
         "Als System möchten wir Einträge automatisch tagger, damit Analytics möglich sind.",
         ["Async getriggert nach POST/PATCH /journal/entries",
          "4 parallele AI-Calls: format, activities, sentiments, goals",
          "Persistierung in DynamoDB Entry-Item",
          "Goal-Verknüpfung via M:N-Items",
          "Idempotent (bei Retry kein Doppelschreiben)"],
         "EventBridge / SQS als Trigger. Goal-Match nutzt Embedding oder Title-Match.",
         ""),

        ("[Backend] Goal-Recommendation + Goal-Refinement Lambdas", 3,
         "Als Nutzer möchte ich KI-Goal-Vorschläge und Beschreibungs-Verbesserung, damit Goal-Erstellung leichtfällt.",
         ["POST /goals/recommend liest letzte 30 Einträge, ruft AI auf, gibt 3 JSON-Vorschläge zurück",
          "POST /goals/enhance-description liefert verbesserten Text",
          "Recommend ist für alle, Pickup (= POST /goals/) bei Free 403 wenn ai_pickup=true Flag",
          "Refinement bei Free 1x/Tag, Premium unlimited"],
         "",
         ""),

        ("[Backend] AI-Chatbot-Lambda (Premium-Only, Context: 10 Entries + Goals)", 5,
         "Als Premium-Nutzer möchte ich einen Chatbot mit meinem Kontext, damit ich tiefere Reflexion erlebe.",
         ["POST /ai/chat mit message + conversation_id",
          "Premium-Required: 403 bei Free",
          "Kontext: 10 letzte Entries + alle Goals injiziert in System-Prompt",
          "Streaming-Response via Lambda Function URL (oder API Gateway)",
          "Conversation-Items in DynamoDB persistiert"],
         "Streaming bevorzugt für UX.",
         ""),

        ("[Backend] Analytics-Aggregation Lambdas (trends/stats/correlations/summary)", 5,
         "Als Nutzer möchte ich aggregierte Insights über Zeit, damit ich Muster erkenne.",
         ["GET /analytics/trends (period, moving avg)",
          "GET /analytics/stats (avg sentiments, sleep, stress, social, streak, words)",
          "GET /analytics/correlations (Pearson) + AI-Insights, Cache 24h",
          "GET /analytics/summary (KI-generiert) mit Cache + async-refresh",
          "Free: 30 Tage; Premium 90/365 + Korrelationen"],
         "Cache-Items in DynamoDB CACHE#TYPE#PERIOD.",
         ""),

        ("[Backend] AI-Provider-Abstraction (Interface + EU-Adapter + US-Adapter)", 8,
         "Als System möchten wir AI-Provider austauschbar haben (EU vs US), damit Datenschutz und Kosten steuerbar sind.",
         ["Interface AIProvider mit complete(), embed()",
          "EU-Adapter (z.B. Mistral-EU)",
          "US-Adapter (z.B. OpenAI / Anthropic / Gemini US)",
          "Routing-Logik liest Config aus DynamoDB CONFIG-Item",
          "Pro-Feature-Override möglich",
          "Tier-Default: Free=US, Premium=EU",
          "Token-Usage + Cost-Logging in AILOG-Items",
          "Retry mit exponential backoff (1s/2s/4s)",
          "Fallback US wenn EU 5xx > 50% in 5min"],
         "Provider-Auswahl bewusst nicht hartkodiert (Andrii/Marketing definiert).",
         ""),

        ("[Backend] AI-Credentials in AWS Secrets Manager + Rotation", 3,
         "Als Reflecta möchten wir API-Keys sicher verwahren, damit Compromise vermieden wird.",
         ["Secrets für EU-Provider, US-Provider, Stripe, Cognito separat",
          "Rotation alle 90 Tage geplant (Trigger via EventBridge)",
          "IAM Least-Privilege auf Secret-ARN pro Lambda",
          "Lokale Dev-Stores via .env (gitignored)"],
         "",
         ""),

        ("[Backend] Stripe-Integration (Checkout + Webhooks + Customer Portal)", 8,
         "Als Reflecta möchten wir Premium-Abos verkaufen, damit Monetarisierung funktioniert.",
         ["Stripe-Produkte 'Reflecta Plus monatlich' + 'jährlich' angelegt",
          "POST /billing/checkout-session erzeugt Stripe Checkout",
          "Webhook /billing/webhook verifiziert Signatur, persistiert Subscription-Status in DynamoDB",
          "Events: checkout.session.completed, customer.subscription.updated, invoice.payment_failed",
          "GET /billing/portal-link liefert Stripe-Customer-Portal-URL",
          "Tax: Stripe-Tax aktiviert (DE-USt)",
          "Idempotency-Keys auf alle Stripe-Calls"],
         "Test-Mode in dev/staging, Live-Mode nur prod.",
         ""),

        ("[Backend] Quota-Enforcement Middleware + Tier-Gates", 5,
         "Als System möchten wir Free-Tier-Limits durchsetzen, damit Premium-Anreiz erhalten bleibt.",
         ["Decorator @requires_tier('premium') auf Premium-Endpoints",
          "Decorator @consumes_quota(name, free=N, premium=None)",
          "DynamoDB QUOTA-Item: USER#sub#QUOTA#name -> count + reset_at",
          "Reset-Strategie: per-entry, daily, monthly konfigurierbar",
          "Headers X-Quota-Remaining + X-Quota-Reset bei Response"],
         "Bei Verstoss 403 (Tier) bzw. 429 (Quota).",
         ""),

        ("[Backend] DSGVO-Endpoints (GET /me/export, DELETE /me/account, Soft-Delete)", 5,
         "Als Nutzer möchte ich gesetzlich garantiert Daten exportieren / löschen können, damit DSGVO Art.15/17 erfüllt ist.",
         ["GET /me/export startet Async-Job, schreibt JSON nach S3 (presigned URL per Mail)",
          "DELETE /me/account markiert Soft-Delete (30 Tage)",
          "Hard-Delete-Job läuft täglich, kaskadiert Items",
          "Audit-Log persistiert Anfragen",
          "User wird bei Löschung aus Cognito entfernt"],
         "S3-Bucket mit Encryption + Lifecycle 30 Tage.",
         ""),

        ("[Backend] Consent-Storage Endpoint (Cookie-Settings persistieren)", 2,
         "Als Reflecta möchten wir Consent revisionssicher speichern, damit DSGVO-Nachweis möglich ist.",
         ["POST /consent (categories, version, timestamp)",
          "GET /consent liefert aktuelle Settings",
          "Auch für anonyme Nutzer (Cookie-ID) speicherbar",
          "DynamoDB-Item mit TTL 13 Monate"],
         "",
         ""),

        ("[Backend] Admin-Endpoints (Stats, User-Mgmt, Subscriptions, DSAR, Feature-Flags)", 5,
         "Als Admin möchte ich alle Admin-UI-Funktionen über sichere Endpoints aufrufen, damit Konsole funktioniert.",
         ["GET /admin/stats",
          "GET /admin/users + PATCH /admin/users/{id} + DELETE /admin/users/{id}",
          "GET /admin/subscriptions + PATCH",
          "POST /admin/dsar/export, DELETE /admin/dsar/account",
          "GET/PUT /admin/feature-flags",
          "GET/PUT /admin/ai-routing",
          "Alle Endpoints @requires_admin"],
         "Admin-Rolle via Cognito-Group oder is_admin Flag.",
         ""),

        ("[Backend] Admin-Business-Metrics + Pricing-Control Endpoints", 5,
         "Als Admin-UI möchte ich Premium-/Conversion-/Profit-Metriken und Pricing-Änderung über Endpoints konsumieren, damit ADM-00-Erweiterung funktioniert.",
         ["GET /admin/business-metrics liefert: premium_count, free_count, conversion_rate_30d, mrr, ai_cost_30d, profit_30d, fixed_costs_monthly",
          "GET /admin/business-metrics?period=90d optional für Trend-Chart",
          "PUT /admin/pricing (monthly_eur, annual_discount_pct) - validiert + audit-logged",
          "PUT /admin/pricing erzeugt neue Stripe-Price-Objects (alte bleiben für Bestandskunden)",
          "PUT /admin/fixed-costs erlaubt Anpassung der Fixkostenbasis",
          "MRR-Berechnung aus Stripe-API (cached 5min)",
          "AI-Cost-Berechnung aus AILOG-Items mit Provider-Preis-Tabelle",
          "Alle Endpoints @requires_admin + audit-log"],
         "Stripe-Price-Objects sind immutable - Änderung = neues Objekt + Default umstellen. Bestandsabos bleiben auf altem Price-Objekt.",
         ""),

        ("[Backend] Feature-Flag-Endpoint (Frontend-Eval + Admin-Mgmt)", 3,
         "Als Frontend möchte ich Feature-Flags abrufen, damit ich Cohort-Rollouts unterstütze.",
         ["GET /flags/me liefert aufgelöste Flags pro User",
          "Cohort-Resolver (tier, country, user-id)",
          "Admin-Endpoints in vorigem Ticket",
          "Cache-Header 60s"],
         "",
         ""),

        ("[Backend] Reporting-/Moderation-Endpoint (User meldet Content)", 2,
         "Als Nutzer möchte ich Inhalte melden können, damit Plattform sicher bleibt.",
         ["POST /reports (target_type, target_id, reason)",
          "Erzeugt MODREPORT#-Item",
          "Admin-Queue liest aus dem Item-Pattern"],
         "",
         ""),

        ("[Backend] Reminder-Dispatcher (Daily Push-Notifications)", 3,
         "Als System möchten wir Reminder verschicken, damit Streaks erhalten bleiben.",
         ["EventBridge-Schedule täglich",
          "Lambda iteriert Subscriptions",
          "Web-Push via VAPID",
          "Bounces deaktivieren Subscription"],
         "",
         ""),

        ("[Backend] Demo-Session-Endpoint (5-Min temporäre Session, Seed-Daten)", 3,
         "Als Interessent möchte ich eine 5-Min-Demo-Session, damit ich die App vorab teste.",
         ["POST /auth/demo-session erzeugt JWT mit 5-Min-Expiry",
          "Seed-Daten via Demo-User (read-only auf prod-Daten)",
          "Rate-Limit pro IP (max 5/Tag)",
          "Logout nach Ablauf erzwungen"],
         "Demo-User wird einmalig provisioniert.",
         ""),

        ("[Backend] CI/CD GitHub Actions -> CDK-Deploy + Tests", 5,
         "Als Team möchten wir automatisches Deployment, damit Changes schnell + sicher live gehen.",
         ["Workflow: lint, type-check, pytest, cdk synth/diff, deploy dev",
          "Approval-Gate für staging und prod",
          "Rollback-Workflow vorhanden",
          "Branch-Protection: PRs müssen grün sein"],
         "",
         ""),

        ("[Backend] Observability (CloudWatch Logs/Metrics/Alarms + X-Ray)", 3,
         "Als Team möchten wir produktive Probleme schnell erkennen, damit User-Impact minimiert wird.",
         ["Strukturierte JSON-Logs an CloudWatch",
          "Custom-Metrics: Quota-Hits, Premium-Calls, AI-Errors",
          "Alarms: 5xx-Rate, Lambda-Errors, AI-Cost-Burn",
          "X-Ray Tracing für kritische Flows",
          "Synthetic Health-Check 1/min"],
         "",
         ""),

        ("[Backend] Rate-Limiting + AWS WAF an API Gateway", 3,
         "Als Reflecta möchten wir Brute-Force / Scraping abwehren, damit Verfügbarkeit erhalten bleibt.",
         ["WAF mit Managed Rule-Set (AWSManagedRulesCommonRuleSet)",
          "Rate-Limit-Rule: 1000 req/5min/IP",
          "Geo-Block falls relevant",
          "Bot-Control opt-in"],
         "",
         ""),

        ("[Backend] Backend-Tests (pytest + LocalStack + Contract-Tests)", 5,
         "Als Team möchten wir verlässliche Tests, damit Regressionen vermieden werden.",
         ["Unit-Tests pro Lambda-Handler",
          "Integration-Tests gegen LocalStack DynamoDB",
          "Contract-Tests Frontend<->Backend (z.B. OpenAPI/Schemathesis)",
          "Coverage-Schwelle 70%",
          "CI bricht ab bei Verstoss"],
         "",
         ""),

        ("[Backend] OpenAPI-Spec generieren + Stoplight/SwaggerUI bereitstellen", 2,
         "Als Frontend-Team möchte ich aktuelle API-Doku, damit Integration einfacher ist.",
         ["OpenAPI 3.1 Spec aus Pydantic-Modellen erzeugt",
          "/docs Endpoint im API-Gateway",
          "Versionierung der Spec (v1)",
          "CI publiziert Spec auf S3"],
         "",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Bilal",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_datenmodell() -> None:
    eid = make_epic(
        subject="[EPIC] Backend-Datenmodell",
        owner="Tristan",
        description=epic_body(
            dept="Backend-Datenmodell",
            owners=["Tristan (5967670)", "Jan (7962446)"],
            goal=(
                "Vollständiges DynamoDB One-Table-Design gemäß Datenmodell-PDF: PK/SK + LSI1-3 + GSI1-3, "
                "alle Entity-Items, M:N-Beziehungen, Caches, AI-Logs. Inkl. IaC, PITR, Backups, DSGVO-Datenpfade."
            ),
            scope=(
                "- Single-Table-Schema, Item-Layouts, Indizes\n"
                "- IaC-Provisioning (CDK)\n"
                "- Repository-Layer (Python boto3)\n"
                "- Capacity-Planning, PITR, Backups\n"
                "- DSGVO-Datenmodell (Soft-Delete, Hard-Delete-Job)\n"
                "- Seed-Daten für Demo-Account"
            ),
        ),
    )
    dept = "Backend-Datenmodell"
    own = ["Tristan", "Jan"]

    tasks = [
        ("[Datenmodell] Single-Table-Spec finalisieren (PK/SK Konventionen, Item-Types)", 5,
         "Als Team möchten wir eine eindeutige Schema-Definition für alle Items, damit jeder Entwickler konsistent schreibt.",
         ["Doku im Confluence: alle Item-Types mit PK/SK-Pattern",
          "Item-Diskriminator implizit über SK-Präfix (ENTRY#, GOAL#, CACHE#, AILOG#)",
          "JSON-Schema/Pydantic-Modelle pro Item-Type",
          "Beispiel-Items pro Pattern dokumentiert"],
         "Aus PDF: USER, JournalEntry, Goal, Entry-Goal-Link bidirektional, AnalyticsCache, AIUsageLog.",
         "Datenmodell-PDF Kap.1-5"),

        ("[Datenmodell] Table Provisioning (CDK) inkl. PITR + On-Demand", 3,
         "Als Team möchten wir die Tabelle reproduzierbar provisionieren, damit Umgebungen identisch sind.",
         ["CDK-Stack 'DataStack' mit Tabelle 'reflecta-main'",
          "Billing PAY_PER_REQUEST (On-Demand)",
          "PITR aktiviert",
          "Encryption AWS-managed",
          "DeletionProtection true in prod"],
         "Tabelle pro Environment getrennt (reflecta-main-dev, -staging, -prod).",
         ""),

        ("[Datenmodell] LSI1 Entries-by-Date konfigurieren", 2,
         "Als App möchte ich Einträge chronologisch lesen, damit Listen sortiert sind.",
         ["LSI1 mit SK-Attribut date#-prefix",
          "Projection ALL",
          "Query-Test mit BETWEEN-Operator",
          "Capacity-Hinweis dokumentiert"],
         "",
         "Datenmodell LSI1"),

        ("[Datenmodell] LSI2 Goals-by-Category", 2,
         "Als App möchte ich Goals nach Kategorie filtern, damit UI-Filter funktioniert.",
         ["LSI2 mit SK GOAL#CAT#<category>",
          "Projection KEYS_ONLY (Cost-Saving)",
          "Test-Queries dokumentiert"],
         "",
         "Datenmodell LSI2"),

        ("[Datenmodell] LSI3 Goals-by-Priority", 2,
         "Als App möchte ich Goals nach Priorität sortieren, damit wichtige Ziele oben stehen.",
         ["LSI3 mit SK GOAL#PRIO#<priority>",
          "Projection KEYS_ONLY",
          "Test-Queries"],
         "",
         "Datenmodell LSI3"),

        ("[Datenmodell] GSI1 Login-by-Email konfigurieren", 3,
         "Als Auth möchte ich User per E-Mail finden, damit Login funktioniert.",
         ["GSI1 PK=EMAIL#<email>, SK=USER#<sub>",
          "Eindeutigkeitsprüfung in Repo-Layer",
          "Projection ALL"],
         "Cognito ist primäre Auth - GSI1 dient internem Lookup.",
         "Datenmodell GSI1"),

        ("[Datenmodell] GSI2 Admin-/Cross-User-Indexierung", 3,
         "Als Admin möchte ich User/Entries/Goals global filtern können, damit Reports gehen.",
         ["GSI2 PK=ENTITY#<type>, SK=<created_at>#<id>",
          "Items mit gsi2_pk + gsi2_sk Felder",
          "Test: Admin-Stats-Aggregation"],
         "",
         "Datenmodell GSI2"),

        ("[Datenmodell] GSI3 AI-Usage-Aggregation", 3,
         "Als System möchten wir AI-Calls nach Feature aggregieren, damit Kosten/Erfolg messbar sind.",
         ["GSI3 PK=AILOG#<feature>, SK=<created_at>#<logId>",
          "Items mit gsi3_pk + gsi3_sk",
          "Query-Tests"],
         "",
         "Datenmodell GSI3"),

        ("[Datenmodell] User-Item Schema + Provisioning-Trigger (post-confirmation)", 3,
         "Als System möchten wir User-Items konsistent anlegen, damit Profile da sind.",
         ["Felder: cognito_sub, email, is_admin, tier, premium_until, stripe_customer_id, ai_region_pref, created_at",
          "post-confirmation Lambda schreibt Item",
          "Idempotent (PK/SK conditional put)"],
         "tier default 'free'.",
         ""),

        ("[Datenmodell] JournalEntry-Item Schema + sentiments/activities Listen", 3,
         "Als App möchten wir Einträge mit Anreicherung speichern, damit Analytics möglich sind.",
         ["Felder: title, date, content, formatted_content, sentiment_level, sleep_quality, stress_level, social_engagement, activities[], sentiments[]",
          "date als ISO-String",
          "Numerik 1-5 als Integer",
          "max content length dokumentiert (z.B. 10000 chars)"],
         "Compression nicht nötig falls <400KB Item-Limit.",
         ""),

        ("[Datenmodell] Goal-Item Schema + progress 0-100", 2,
         "Als App möchten wir Goals mit Status/Progress speichern.",
         ["Felder: title, type, category, priority, description, target_date, progress, created_at, updated_at",
          "Inferred status (active/completed/overdue) dokumentiert",
          "Progress validiert 0-100"],
         "",
         ""),

        ("[Datenmodell] Entry<->Goal M:N-Items (beide Richtungen)", 3,
         "Als App möchten wir bidirektional verknüpfen, damit Lookups effizient sind.",
         ["SK ENTRY#<id>#GOAL#<id> + reverse SK GOAL#<id>#ENTRY#<id>",
          "TransactWrite für atomare Verknüpfung",
          "Cleanup bei Delete (siehe DSGVO)"],
         "",
         ""),

        ("[Datenmodell] AnalyticsCache-Items (TTL + Stale-While-Revalidate)", 3,
         "Als System möchten wir Analytics cachen, damit Antwortzeiten kurz sind.",
         ["SK CACHE#<type>#<period>",
          "TTL 24h via DynamoDB-TTL-Attribut (auto-delete)",
          "stale-marker für SWR-Pattern",
          "content als JSON-Blob"],
         "",
         ""),

        ("[Datenmodell] AIUsageLog-Items + Aggregations-Felder", 3,
         "Als Admin möchten wir AI-Calls auswerten, damit Reports gehen.",
         ["SK AILOG#<created_at>#<logId>",
          "Felder: feature, model, provider_region, input_tokens, output_tokens, success, error",
          "TTL 90 Tage (DSGVO-Minimierung)",
          "GSI3 für cross-user Filter"],
         "",
         ""),

        ("[Datenmodell] Subscription-/Tier-Felder (premium_until, stripe_customer_id)", 2,
         "Als System möchten wir Tier-Status persistieren, damit Premium-Gates funktionieren.",
         ["Felder im User-Item: tier, premium_until, stripe_customer_id, stripe_subscription_id",
          "Index oder Skript für abgelaufene Premium-Downgrades"],
         "Tagesjob downgraded user wenn premium_until < now.",
         ""),

        ("[Datenmodell] Quota-Item-Schema (Reflexion 3/Entry, daily-Limits)", 2,
         "Als System möchten wir Quotas robust persistieren, damit Free-Limits korrekt greifen.",
         ["SK QUOTA#<feature>#<scope>",
          "Atomic UpdateItem mit ConditionExpression",
          "reset_at als Timestamp"],
         "",
         ""),

        ("[Datenmodell] Consent-Item + Audit-Log-Item Schema", 2,
         "Als Reflecta möchten wir DSGVO-Nachweise speichern, damit Audits bestehen.",
         ["Consent-Item SK CONSENT#<version>",
          "Audit-Log-Item SK AUDIT#<timestamp>#<actor>#<action>",
          "Audit-TTL 5 Jahre (Compliance)"],
         "",
         ""),

        ("[Datenmodell] Repository-Layer Python (boto3, typed) + Tests", 5,
         "Als Entwickler möchte ich eine Abstraktion über DynamoDB, damit Lambda-Code schlank bleibt.",
         ["Repo-Klassen pro Entity (UserRepo, JournalRepo, GoalRepo, ...)",
          "Pydantic-Modelle als Return-Types",
          "Cursor-Pagination via LastEvaluatedKey-Encoding",
          "Unit-Tests gegen LocalStack",
          "Type-Coverage 100%"],
         "Optional: PynamoDB falls Team das bevorzugt.",
         ""),

        ("[Datenmodell] Backup-/PITR-Strategie + DR-Test", 2,
         "Als Reflecta möchten wir keine Daten verlieren, damit Vertrauen erhalten bleibt.",
         ["PITR aktiviert in prod (35 Tage)",
          "Tagesjob exportiert nach S3 (Glacier 1 Jahr)",
          "Quartalsweiser Restore-Test dokumentiert"],
         "",
         ""),

        ("[Datenmodell] Capacity-Planning + Cost-Monitoring (CloudWatch)", 3,
         "Als Team möchten wir Throttling/Kosten früh sehen, damit wir reagieren können.",
         ["Doku: erwartete RCU/WCU pro Endpoint",
          "On-Demand für dev/staging, Provisioned mit Auto-Scaling für prod (falls Volumen rechtfertigt)",
          "Cost-Anomaly-Alarm",
          "Capacity-Forecast-Modell"],
         "",
         ""),

        ("[Datenmodell] Seed-Skript für Demo-Account + Fixtures", 3,
         "Als Team möchten wir reproduzierbare Demo-Daten, damit Landingpage-Demo-Login Sinn macht.",
         ["Python-Skript erzeugt Demo-User + 30 Einträge + 5 Goals + Analytics-Cache",
          "Idempotent: kann ohne Doppelschreiben re-run werden",
          "Aufruf via Make-Target oder CDK-CustomResource"],
         "",
         ""),

        ("[Datenmodell] Schema-Versionierung + Migration-Skripte", 3,
         "Als Team möchten wir Schema-Änderungen sauber rollen, damit Deploys nicht bremsen.",
         ["Items haben Feld 'schema_version'",
          "Migration-Skripte als Lambda-Functions",
          "Backfill-Job-Pattern dokumentiert"],
         "",
         ""),

        ("[Datenmodell] DSGVO-Datenpfade (Soft-Delete + Hard-Delete-Job + Export)", 5,
         "Als Reflecta müssen wir DSGVO-konform löschen/exportieren, damit Bußgelder vermieden werden.",
         ["Soft-Delete-Flag im User-Item (deleted_at)",
          "Hard-Delete-Job läuft täglich, kaskadiert alle PK USER#sub Items",
          "Export-Job sammelt alle Items des Users in JSON, schreibt nach S3",
          "Audit-Eintrag pro Aktion",
          "Tests gegen LocalStack"],
         "",
         ""),

        ("[Datenmodell] DynamoDB-Streams aktivieren für Analytics-Pipeline", 2,
         "Als System möchten wir Stream-basierte Reaktionen (Cache-Invalidation, Indexer), damit Daten konsistent bleiben.",
         ["StreamSpecification NEW_AND_OLD_IMAGES",
          "Lambda-Trigger registriert",
          "Beispiel: Cache invalidieren bei JournalEntry-Update",
          "DLQ konfiguriert"],
         "",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Tristan",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_marketing() -> None:
    eid = make_epic(
        subject="[EPIC] Marketing & Vertrieb",
        owner="Srisharanya",
        description=epic_body(
            dept="Marketing & Vertrieb",
            owners=["Daria (2036658)", "Srisharanya (4454610)"],
            goal=(
                "Vollständige Go-To-Market-Strategie: User-Forschung (Zahlungsbereitschaft + US-Server-Akzeptanz), "
                "Pricing/Break-Even, Premium/Basis-Feature-Definition, Channels, KPIs, Content."
            ),
            scope=(
                "- User-Studies (Pricing, US-Server, Personas)\n"
                "- Wettbewerbsanalyse, Positionierung\n"
                "- Pricing/Break-Even, Feature-Definition\n"
                "- Channels (SEO, SEA, Social, Influencer, ASO, PR)\n"
                "- Content/Editorial-Plan, Newsletter\n"
                "- KPI-Framework, CRM-Setup"
            ),
        ),
    )
    dept = "Marketing & Vertrieb"
    own = ["Daria", "Srisharanya"]

    tasks = [
        ("[Marketing] User-Studie Zahlungsbereitschaft (Van-Westendorp + Conjoint)", 5,
         "Als Reflecta möchten wir Preisbereitschaft empirisch ermitteln, damit Pricing nicht geraten ist.",
         ["Survey-Instrument (Van-Westendorp + Conjoint) entworfen",
          "Mind. n=100 Teilnehmer rekrutiert (DACH-Studierende + Self-Improver)",
          "Auswertung mit Optimal Price Point + Range",
          "Confidence-Intervalle + Segment-Splits",
          "Empfehlungsbericht im Confluence"],
         "Datenschutz: Pseudonymisierung, AVV mit Survey-Tool.",
         ""),

        ("[Marketing] User-Studie Akzeptanz US-Server für AI-Calls (DSGVO-Sensitivität)", 3,
         "Als Reflecta möchten wir wissen ob US-Server für Free-Tier akzeptabel sind, damit Cost-Optimum erreicht wird.",
         ["Qualitative Interviews (n>=12) + quantitative Survey (n>=100)",
          "Hypothesen: 'Free-User akzeptieren US, Premium-User wollen EU'",
          "Auswertung Pro EU- vs US-Akzeptanz",
          "Empfehlung mit Risiko-Hinweisen"],
         "Input für Backend AI-Routing-Default + Marketing-Messaging.",
         ""),

        ("[Marketing] Persona-Refinement basierend auf Studien-Ergebnissen", 3,
         "Als Marketing möchten wir 3 priorisierte Personas mit Quotes/Daten, damit alle Departments synchron sind.",
         ["3 Personas (Bedarf, Goals, Reibungspunkte, Channels)",
          "Quotes aus Interviews",
          "Persona-Decks für Brand/Frontend",
          "Validiert mit Stakeholdern"],
         "",
         ""),

        ("[Marketing] Wettbewerbsanalyse (Daylio, Reflectly, Stoic, Rosebud, Day One)", 3,
         "Als Reflecta möchten wir Differenzierung sauber verstehen, damit Positionierung scharf wird.",
         ["Feature-Matrix (>=5 Wettbewerber)",
          "Pricing-Vergleich",
          "USP-Liste pro Wettbewerber",
          "Whitespace-Analyse",
          "Empfehlung Differenzierung"],
         "",
         ""),

        ("[Marketing] Pricing-Modell + Break-Even-Rechnung (Cost EU vs US)", 5,
         "Als Reflecta möchten wir Pricing rechnen das Profit bei realistischer Userzahl macht, damit Business tragfähig ist.",
         ["Excel-/Sheets-Modell mit Variablen (Tokens, Provider-Kosten, Conversion, Churn)",
          "Break-Even bei verschiedenen User-Mengen (1k/10k/100k)",
          "Sensitivitätsanalyse für EU vs US Provider-Mix",
          "Empfehlung Pricing-Punkt + Annual-Discount %",
          "Review mit Business-Modell-Team"],
         "",
         ""),

        ("[Marketing] Premium- vs Basis-Feature-Definition finalisieren", 3,
         "Als Marketing möchten wir Feature-Listen klar, damit UI/Backend Gates korrekt setzen.",
         ["Tabelle Free vs Premium mit allen Features",
          "Begründung pro Limit (Wert + Kosten)",
          "Edge-Cases (Fair-Use) dokumentiert",
          "Sign-Off von Frontend, Backend, Business"],
         "Default-Annahme aus User-Briefing: Goals AI-Pickup Premium, Chat Premium, Analytics 30 Tage Free / 90/365 Premium, 3 Reflexionen Free.",
         ""),

        ("[Marketing] Go-To-Market-Plan + Launch-Roadmap", 5,
         "Als Team möchten wir einen GTM-Plan, damit Launch koordiniert ist.",
         ["Soft-Launch + Public-Launch Termine",
          "Kanal-Mix mit Budget-Verteilung",
          "Launch-Assets (Mail, Posts, PR-Pitch)",
          "Risiko-Plan + Mitigation"],
         "",
         ""),

        ("[Marketing] SEO-Strategie + Keyword-Research", 3,
         "Als Reflecta möchten wir organische Sichtbarkeit, damit CAC sinkt.",
         ["Keyword-Liste (Volumen, Difficulty, Intent)",
          "Cluster-Plan mit Pillar-Pages",
          "On-Page-Briefings für Landingpage",
          "Tracking-Plan (GSC + Rank-Tracker)"],
         "",
         ""),

        ("[Marketing] SEA-/Performance-Plan (Google Ads + Meta) inkl. Budget", 3,
         "Als Reflecta möchten wir paid Channels gezielt einsetzen, damit Wachstum skaliert.",
         ["Kampagnen-Hierarchie (Search/Demand-Gen/Meta)",
          "Anzeigentexte + Bilder",
          "CAC-Ziele pro Persona",
          "Budget-Plan 3 Monate",
          "Tracking via UTM + Conversion-Pixel"],
         "",
         ""),

        ("[Marketing] Social-Media-Strategie + Editorial-Kalender (TikTok, IG, LinkedIn)", 3,
         "Als Reflecta möchten wir kontinuierlich Inhalte, damit Marke aufgebaut wird.",
         ["Plattform-Strategie (Tonalität, Frequenz)",
          "Editorial-Kalender 3 Monate",
          "Content-Pillars definiert",
          "Influencer-Shortlist (>=10)",
          "Brand-Templates für Posts"],
         "Templates kommen vom Brand-Team.",
         ""),

        ("[Marketing] PR-Plan + Pressekit", 2,
         "Als Reflecta möchten wir Earned Media, damit Reichweite skaliert.",
         ["Pressekit (PDF, Bilder, Founder-Bios)",
          "Outreach-Liste (Tech, Mental-Health, Studi-Magazine)",
          "Embargo-Strategie",
          "Pitch-Templates"],
         "",
         ""),

        ("[Marketing] App-Store-Optimization (PWA-Listing + ggf. App-Store-Wrapper)", 2,
         "Als Reflecta möchten wir mobile Discovery, damit Wachstum nicht nur Web kommt.",
         ["Keywords (Title, Subtitle)",
          "Screenshots (5x DE/EN)",
          "Beschreibung optimiert",
          "Localization-Plan"],
         "PWA hat keinen App-Store; später ggf. Capacitor-Wrapper.",
         ""),

        ("[Marketing] Newsletter + Lifecycle-Email-Funnel", 3,
         "Als Reflecta möchten wir Retention via Email, damit Free->Premium-Conversion steigt.",
         ["Provider-Auswahl (z.B. Mailjet/Brevo)",
          "Welcome-Series (5 Mails)",
          "Re-Engagement-Series",
          "Wöchentlicher Insight-Newsletter (KI-generiert je User: optional)",
          "DSGVO-Confirmation, AVV"],
         "",
         ""),

        ("[Marketing] Landingpage-Copy + A/B-Test-Hypothesen", 3,
         "Als Marketing möchten wir testbare Copy-Varianten, damit Conversion gemessen optimiert wird.",
         ["3 Hero-Headlines zur Auswahl",
          "2 CTA-Texte",
          "Pricing-Wording-Varianten",
          "A/B-Test-Plan + KPI-Schwellen"],
         "Frontend-Hooks siehe Landingpage-Ticket.",
         ""),

        ("[Marketing] KPI-Framework (CAC, LTV, MRR, Churn, Conversion-Funnel)", 3,
         "Als Team möchten wir einheitliche KPIs, damit Entscheidungen datengetrieben sind.",
         ["KPI-Definitionen + Datenquellen",
          "Dashboards (Looker/Metabase) skizziert",
          "Reporting-Cadence (wöchentlich/monatlich)",
          "Owner pro KPI"],
         "",
         ""),

        ("[Marketing] CRM-/Sales-Funnel Setup (HubSpot Free oder ähnlich)", 3,
         "Als Reflecta möchten wir Leads/Conversions tracken, damit Funnel optimierbar wird.",
         ["CRM-Tool ausgewählt + DSGVO-konform konfiguriert",
          "Funnel-Stages dokumentiert",
          "Lead-Capture-Forms eingebunden",
          "Webhook von Stripe -> CRM (Premium-Status)"],
         "",
         ""),

        ("[Marketing] Hochschul-Kooperationen (Pilot-Distribution)", 2,
         "Als Reflecta möchten wir Hochschul-Pilot-Partner, damit Validierung + B2B-Pipeline entsteht.",
         ["Shortlist 10 Hochschulen",
          "Pitch-Material",
          "Pilot-Vertragsentwurf",
          "Erster Outreach versendet"],
         "",
         ""),

        ("[Marketing] Beta-Programm + Referral-System", 3,
         "Als Reflecta möchten wir Mund-zu-Mund-Wachstum fördern, damit CAC sinkt.",
         ["Closed-Beta-Liste mit Invite-Codes",
          "Referral-Modell definiert (z.B. 1 Monat Premium pro Referral)",
          "Tracking via Referral-Code in Backend",
          "Anti-Abuse-Regeln"],
         "Backend-Abhängigkeit: Referral-Endpoint.",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Srisharanya",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_brand() -> None:
    eid = make_epic(
        subject="[EPIC] Brand & Design",
        owner="Andrii",
        description=epic_body(
            dept="Brand & Design",
            owners=["Andrii (2349199)"],
            goal=(
                "Vollständiges Brand- und Design-System gemäß Reflecta StyleGuide v1.0 (Animatic). "
                "Dazu Pricing-Page-Design, Premium-Markierungen, Mobile-Tokens, App-Icons, Marketing-Templates."
            ),
            scope=(
                "- Logo-Varianten + App-Icons + Favicons\n"
                "- Color-/Typo-/Spacing-Tokens (Code-Export)\n"
                "- Emotive Lexicon Icon-Set (8 States)\n"
                "- Motion-Library (11 Events)\n"
                "- Komponenten-Library (Buttons/Inputs/Cards/Chips)\n"
                "- Pricing-Page + Premium-Badges\n"
                "- Onboarding-/Empty-State-Illustrationen\n"
                "- Marketing-Templates (Social/OG)\n"
                "- A11y-Kontrast-Audit, Dark-Mode (optional)"
            ),
        ),
    )
    dept = "Brand & Design"
    own = ["Andrii"]

    tasks = [
        ("[Brand] Logo-Varianten finalisieren (Inline-Lockup, Icon-Only, Mono Light/Dark)", 3,
         "Als Reflecta möchten wir Logo in allen Kontexten nutzen können, damit Brand konsistent ist.",
         ["Inline-Lockup (Wortmarke + Bildmarke)",
          "Icon-Only (R-Symbol)",
          "Mono Light + Dark",
          "SVG + PNG-Exports in 16/32/64/128/256/512",
          "Usage-Guidelines im Style Guide"],
         "Quelle: StyleGuide-Animatic Section Brand.",
         ""),

        ("[Brand] App-Icon iOS/Android + Favicon (mit Maskable-Variante)", 2,
         "Als Nutzer möchten wir App-Icon auf Homescreen sehen, damit Wiedererkennbarkeit gegeben ist.",
         ["iOS 1024x1024",
          "Android adaptive icon (foreground + background)",
          "Favicon 32x32, 192x192 (PWA), 512x512 + maskable",
          "Apple Touch Icon"],
         "",
         ""),

        ("[Brand] Color-Tokens als CSS Vars + Tailwind-Config + JSON Tokens", 3,
         "Als Frontend-Team möchten wir Tokens als Code, damit Konsistenz automatisiert ist.",
         ["JSON-Token-Datei (Style Dictionary kompatibel)",
          "CSS-Variablen (--color-primary, --color-deep-synthesis, ...)",
          "Tailwind-Theme-Plugin",
          "Beispiel-Page rendert alle Tokens",
          "Tokens dokumentiert in Storybook"],
         "Werte aus StyleGuide: #9B30FF, #6A0DAD, Gradient 135 deg.",
         ""),

        ("[Brand] Typografie-Setup Plus Jakarta Sans + Hierarchie-Klassen", 2,
         "Als Frontend möchten wir typografische Hierarchie automatisiert, damit Konsistenz gegeben ist.",
         ["Plus Jakarta Sans Self-Hosted (woff2, latin + latin-ext)",
          "Klassen: .display, .h1, .h2, .h3, .body, .muted, .eyebrow",
          "font-display:swap",
          "Lighthouse-Score nicht verschlechtert"],
         "",
         ""),

        ("[Brand] Spacing/Radius/Shadow-Token-Set + Breakpoint-Definition", 2,
         "Als Frontend möchten wir spacing-scale + shadow-system, damit Layout-Sprache konsistent ist.",
         ["Tokens radius-sm/md/lg, shadow-sm/md, spacing 4px-Scale",
          "Breakpoints sm:480, md:768, lg:1024, xl:1280",
          "Tailwind-Config angepasst"],
         "",
         ""),

        ("[Brand] Emotive Lexicon Icon-Set (8 Zustände: Joyful..Melancholy)", 3,
         "Als App möchten wir Sentiment visualisieren, damit User Emotionen schnell erkennen.",
         ["8 Icons als SVG (Stern, Mond, Zielscheibe, Herz, abnehm. Mond, Dreieck, Wave, offener Kreis)",
          "Surface-Tints aus StyleGuide",
          "React-Icon-Komponente <EmotionIcon emotion=...>",
          "Storybook-Demo"],
         "",
         ""),

        ("[Brand] Motion-Library (11 Animations-Events)", 5,
         "Als Frontend möchten wir wiederverwendbare Animations-Hooks, damit UX-Konsistenz gegeben ist.",
         ["11 Events: PageEnter, CardHover, ButtonPress, InputFocus, ChipAppear, StreakPulse, ModalEnter, ToastSlide, LogoBreathing, ChartDraw, AITyping",
          "Implementiert via Framer-Motion oder CSS",
          "Easing-Tokens aus StyleGuide",
          "prefers-reduced-motion respektiert",
          "Doku im Storybook mit Live-Demo"],
         "",
         ""),

        ("[Brand] Komponenten-Library (Buttons, Inputs, Cards, Chips, Modals, Toasts)", 8,
         "Als Frontend möchten wir eine wiederverwendbare UI-Library, damit alle Pages konsistent sind.",
         ["React-Komponenten Button, Input, Textarea, Slider, Card, Chip, Modal, Toast, Sidebar",
          "Storybook mit Stories pro Variante (default/hover/focus/disabled)",
          "Unit-Tests (RTL)",
          "Theming via CSS-Vars",
          "WCAG-konform"],
         "",
         ""),

        ("[Brand] Pricing-Page-Design + Premium-Badges (Krone/Lock-Icons)", 3,
         "Als Reflecta möchten wir Pricing/Premium klar visualisieren, damit Conversion erleichtert wird.",
         ["Pricing-Page Design (Free vs Premium)",
          "Premium-Badge (Krone) als Chip-Komponente",
          "Lock-Icon-Variante für geblockte Features",
          "Upsell-Modal-Design",
          "Mobile-Layout"],
         "",
         ""),

        ("[Brand] Onboarding-Flow Illustrationen (Persona-Schritte + erstes Goal)", 3,
         "Als neuer Nutzer möchten wir warmen Onboarding-Eindruck, damit Activation steigt.",
         ["3 Illustrationen passend zum Onboarding",
          "SVG, optimiert <30KB",
          "Animatic-fit (cubic-bezier)",
          "DE/EN-Texte"],
         "",
         ""),

        ("[Brand] Empty-State-Illustrationen (Journal/Goals/Analytics/Calendar)", 3,
         "Als Nutzer möchten wir leere Zustände sympathisch erleben, damit Frustration vermieden wird.",
         ["4 Illustrationen + ermutigender Text",
          "SVG, light + dark Variants"],
         "",
         ""),

        ("[Brand] Marketing-Asset-Templates (Social Posts, OG-Images, Newsletter-Header)", 3,
         "Als Marketing möchten wir wiederverwendbare Templates, damit Content schnell entsteht.",
         ["Figma-Templates für IG-Post, IG-Story, LinkedIn, OG-Image, Newsletter-Header",
          "Brand-Tokens eingebunden",
          "Export-Settings dokumentiert"],
         "",
         ""),

        ("[Brand] Tone-of-Voice-Guide (Do/Dont, Beispieltexte)", 2,
         "Als Team möchten wir konsistente Sprache, damit Brand wahrnehmbar bleibt.",
         ["Tonalität definiert (kognitiv, introspektiv, nicht moralisierend)",
          "Beispiele Do/Dont in DE und EN",
          "UX-Writing-Mikrocopy-Library"],
         "",
         ""),

        ("[Brand] A11y-Kontrast-Audit (alle Token-Kombinationen >=4.5:1 Body, >=3:1 UI)", 3,
         "Als Reflecta wollen wir WCAG 2.2 AA erfüllen, damit niemand ausgeschlossen wird.",
         ["Audit-Tabelle aller Token-Kombinationen",
          "Korrekturen für nicht-konforme Paare",
          "axe-core CI-Check"],
         "",
         ""),

        ("[Brand] Dark-Mode-Tokens + Komponenten-Test (optional, post-MVP-fertig)", 3,
         "Als Nutzer möchten wir Dark-Mode, damit Komfort erhöht wird.",
         ["Dark-Mode-Token-Set",
          "Alle Komponenten in Dark-Mode getestet",
          "Toggle in Account-Settings"],
         "Optional für MVP, aber Tokens sollten vorbereitet sein.",
         ""),

        ("[Brand] Design-System-Dokumentation (Storybook + Figma-Library)", 3,
         "Als Team möchten wir lebendige Dokumentation, damit Brand bestand hat.",
         ["Storybook deployed auf S3/Pages",
          "Figma-Library publiziert mit gleichen Tokens",
          "Versionierung dokumentiert (semver)"],
         "",
         ""),

        ("[Brand] Animatic-Reel/Brand-Video (Hero + Onboarding)", 5,
         "Als Reflecta möchten wir Marken-Erlebnis über Bewegung, damit Wiedererkennung steigt.",
         ["30s Brand-Video",
          "Hero-Animation Loop (Logo-Breathing)",
          "Lottie-Export für Frontend",
          "Sound-Design (optional)"],
         "",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Andrii",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_business() -> None:
    eid = make_epic(
        subject="[EPIC] Business-Modell",
        owner="Andrii",
        description=epic_body(
            dept="Business-Modell",
            owners=["Andrii (2349199)"],
            goal=(
                "Vollständiges Business Model Canvas + Lean + Value Proposition Canvas, finanzielle "
                "Modellierung, Legal/AGB/DSGVO, Rechtsform, Investor-Material."
            ),
            scope=(
                "- BMC 9 Felder (Update mit Monetarisierung)\n"
                "- Lean Canvas + Value Prop Canvas\n"
                "- Pricing/Cost-Modeling EU vs US AI\n"
                "- Legal: AGB, Datenschutz, Impressum, AVV\n"
                "- Rechtsform, Steuern (OSS, Reverse-Charge)\n"
                "- Versicherungen\n"
                "- Finanzplan + Pitch-Deck"
            ),
        ),
    )
    dept = "Business-Modell"
    own = ["Andrii"]

    tasks = [
        ("[Business] Business-Model-Canvas Update mit Monetarisierungs-Hypothese", 3,
         "Als Team möchten wir BMC mit Premium-Modell aktualisiert, damit alle Departments synchron sind.",
         ["Alle 9 Felder aktualisiert",
          "Hypothesen explizit markiert",
          "Review mit Marketing/Brand",
          "Confluence-Page veröffentlicht"],
         "Quelle: Reflecta_BusinessModel_Canvases.pdf.",
         ""),

        ("[Business] Lean Canvas + Value Proposition Canvas finalisieren", 3,
         "Als Team möchten wir Problem/Solution/UVP klar, damit Pitch und Marketing Fundament haben.",
         ["Lean Canvas mit allen 9 Feldern",
          "Value Prop Canvas pro Persona",
          "UVP getestet (Smoke-Test mit 5 Nutzern)"],
         "",
         ""),

        ("[Business] Pricing-Modell finalisieren (Monatlich + Jährlich, EU/US-Region)", 3,
         "Als Reflecta möchten wir endgültige Preise, damit Stripe und Frontend einbauen können.",
         ["Monatspreis EUR finalisiert (Eingang aus Marketing-Studie)",
          "Annual-Discount % finalisiert",
          "Region-Hinweise (EU-Premium, US-Free)",
          "Prufung Vergleichbarkeit Wettbewerb",
          "Sign-Off durch Marketing + Finance"],
         "",
         ""),

        ("[Business] Cost-Modeling EU vs US AI-Provider (Tokens x Preis x Volumen)", 5,
         "Als Reflecta möchten wir AI-Kosten je Tier wissen, damit Pricing margenstark ist.",
         ["Modell mit Tokens pro Action",
          "Preise EU vs US",
          "Wachstums-Szenarien 1k/10k/100k User",
          "Margen-Forecast",
          "Recommendation: Default-Provider pro Tier"],
         "",
         ""),

        ("[Business] AGB + Widerrufsbelehrung für Premium-Abo", 5,
         "Als Reflecta müssen wir AGB liefern, damit Verträge rechtssicher sind.",
         ["Entwurf von Anwalt geprüft",
          "Widerruf 14 Tage konform",
          "Konsumenteninfo + Verbraucherschlichtung",
          "Versionierung mit Datum",
          "DE + EN Variante"],
         "",
         ""),

        ("[Business] Datenschutzerklärung (DSGVO + US-Transfer Art. 49)", 5,
         "Als Reflecta müssen wir Datenschutz transparent kommunizieren, damit DSGVO-Compliance steht.",
         ["DSE deckt alle Verarbeitungen ab",
          "US-Transfer rechtlich begründet (Art. 49 + ggf. SCC)",
          "Verarbeitungsverzeichnis (Art. 30) intern",
          "Rechte (Art. 15-22) erklärt",
          "Cookie-Policy verlinkt"],
         "",
         ""),

        ("[Business] Impressum (TMG / DDG)", 1,
         "Als Reflecta müssen wir Impressum bereitstellen, damit TMG-Pflicht erfüllt ist.",
         ["Anschrift, Vertretung, Kontakt, USt-Id",
          "Verantwortlich i.S.d. Pressrechts",
          "Streitbeilegungs-Hinweis"],
         "",
         ""),

        ("[Business] AVV-Verträge mit AWS, Stripe, AI-Providern", 3,
         "Als Reflecta brauchen wir AVV (Art. 28) mit Auftragsverarbeitern, damit Compliance steht.",
         ["AWS-AVV unterzeichnet",
          "Stripe-AVV unterzeichnet",
          "AVV mit AI-Providern (EU + US)",
          "TIA-Dokument für US-Provider",
          "Liste der Subprozessoren"],
         "",
         ""),

        ("[Business] Rechtsform + Gesellschaftsvertrag (UG/GmbH)", 3,
         "Als Gründer möchten wir saubere Rechtsform, damit Haftung klar ist.",
         ["Rechtsform-Wahl begründet (UG vs GmbH)",
          "Gesellschaftsvertrag entworfen",
          "Notar-Termin + Eintragung HR",
          "Gewerbeanmeldung"],
         "",
         ""),

        ("[Business] Steuerliches Setup (USt, OSS, Reverse-Charge)", 3,
         "Als Reflecta müssen wir Steuern korrekt abwickeln, damit Bußgelder vermieden werden.",
         ["USt-ID beantragt",
          "OSS-Verfahren registriert (EU-B2C)",
          "Reverse-Charge-Logik dokumentiert (EU-B2B)",
          "Stripe Tax aktiviert"],
         "",
         ""),

        ("[Business] Versicherung (E&O, Cyber, Berufshaftpflicht)", 2,
         "Als Reflecta möchten wir Risiken abdecken, damit Schäden bezahlbar bleiben.",
         ["Vergleichsangebote eingeholt",
          "Police abgeschlossen",
          "Deckung dokumentiert"],
         "",
         ""),

        ("[Business] Finanzplan + 24-Monats-Forecast", 5,
         "Als Reflecta möchten wir Liquidität planen, damit kein Engpass entsteht.",
         ["Forecast Monatlich 24 Monate",
          "Best/Realistic/Worst Case",
          "Burn-Rate + Runway",
          "Investitionsbedarf",
          "Sensitivität AI-Kosten"],
         "",
         ""),

        ("[Business] Investor-Pitch-Deck (Seed-Runde)", 3,
         "Als Gründer möchten wir Investoren überzeugen, damit Wachstum finanziert ist.",
         ["10-12 Folien (Problem, Solution, Market, Traction, Business, Team, Ask)",
          "Konsistent mit Brand & Design",
          "Kurz- und Lang-Variante (3min/15min)"],
         "",
         ""),

        ("[Business] Lizenz-/IP-Strategie (Eigene Prompts, OSS-Compliance)", 2,
         "Als Reflecta möchten wir IP sichern + OSS-Lizenzen einhalten, damit Risiken minimiert sind.",
         ["Liste eigener Prompts (geschützt als Geschäftsgeheimnis)",
          "OSS-Lizenz-Audit aller Dependencies",
          "License-Files in Repo"],
         "",
         ""),

        ("[Business] Hochschul-/B2B-Lizenzmodell (Pricing pro Sitz)", 3,
         "Als Reflecta möchten wir Hochschulen monetarisieren, damit Skalierung jenseits B2C möglich ist.",
         ["Pricing-Modell pro Sitz definiert",
          "Volumenrabatte gestaffelt",
          "Mustervertrag",
          "Pilot-Konditionen separat"],
         "",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="Andrii",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def epic_controlling() -> None:
    eid = make_epic(
        subject="[EPIC] Projektcontrolling",
        owner="TobiasM",
        description=epic_body(
            dept="Projektcontrolling",
            owners=["Tobias Meier (9674989)", "Tobias Dietze (6794045)"],
            goal=(
                "End-to-End-Projektcontrolling: Sprint-Tracking, Risk-Mgmt, Budget, Stakeholder, "
                "Quality-Gates, Tooling, Capacity, Compliance/Audit-Doku."
            ),
            scope=(
                "- Roadmap M1-M6 + Sprint-Planung\n"
                "- Risk-Register, Stakeholder-Map\n"
                "- Budget + Stunden-Tracking\n"
                "- DoR/DoD, Quality-Gates\n"
                "- Tooling (OpenProject, Confluence, Slack)\n"
                "- Velocity, Burndown, Capacity\n"
                "- Compliance-Doku DHBW + DSGVO"
            ),
        ),
    )
    dept = "Projektcontrolling"
    own = ["TobiasM", "TobiasD"]

    tasks = [
        ("[Controlling] Projekt-Roadmap M1-M6 (KW20-32) finalisieren", 3,
         "Als PM möchten wir Meilensteine + Liefergegenstände klar haben, damit Team koordiniert arbeitet.",
         ["Gantt-Plan mit M1-M6",
          "Liefergegenstände pro Meilenstein",
          "Abhängigkeiten visualisiert",
          "Im Confluence veröffentlicht"],
         "Aus Projektcontrolling-PDF: M1 KW20-21 bis M6 KW32.",
         ""),

        ("[Controlling] Sprint-Setup (Länge, Ceremonies, Kalender)", 2,
         "Als Team brauchen wir verbindliche Sprint-Struktur, damit Rituale eingehalten werden.",
         ["Sprint-Länge 2 Wochen",
          "Daily-Stand-Up 15min",
          "Sprint Planning, Review, Retro mit Slot",
          "Kalender-Einladungen versendet"],
         "",
         ""),

        ("[Controlling] Definition-of-Ready (DoR) + Definition-of-Done (DoD) harmonisieren", 2,
         "Als Team möchten wir einheitliche Qualitäts-Kriterien, damit Tickets vergleichbar sind.",
         ["DoR-Checkliste (User Story, AC, SP, Designs, Abhängigkeiten)",
          "DoD-Checkliste (Code, Tests, Review, Doku, Staging)",
          "Im Confluence veröffentlicht",
          "An alle Departments kommuniziert"],
         "",
         ""),

        ("[Controlling] Risk-Register aufbauen + monatliches Review", 3,
         "Als PM möchten wir Risiken sichtbar haben, damit Mitigation möglich ist.",
         ["Risk-Register mit >=15 Einträgen (AI-Ausfall, DSGVO, Stripe-Sperre, Wettbewerb, Team-Verfügbarkeit)",
          "Bewertung Likelihood x Impact",
          "Mitigations-Owner",
          "Monatliches Review im Calendar"],
         "",
         ""),

        ("[Controlling] Stakeholder-Map + Kommunikationsplan", 2,
         "Als PM möchten wir Stakeholder + deren Erwartungen klar haben, damit Kommunikation passt.",
         ["Map mit Power-Interest-Matrix",
          "Kommunikationsplan (Cadence, Format)",
          "Status-Reporting wöchentlich an Dozent + Department-Leads"],
         "",
         ""),

        ("[Controlling] Budget-Tracking + Stunden-Erfassung pro Department", 3,
         "Als PM möchten wir Aufwände erfassen, damit Soll-Ist-Vergleiche möglich sind.",
         ["Stunden-Erfassungs-Tool (Toggl/OpenProject Time)",
          "Soll-Stunden je Department dokumentiert (40-60h/Person)",
          "Wöchentlicher Report auf Burn-Rate",
          "Forecasted Overrun-Alarm"],
         "",
         ""),

        ("[Controlling] Sprint-Burndown + Velocity-Tracking", 2,
         "Als Team möchten wir Velocity messen, damit Forecast realistisch wird.",
         ["Burndown-Charts pro Sprint",
          "Velocity-Trend über 3 Sprints",
          "Verwendet im Sprint-Planning"],
         "",
         ""),

        ("[Controlling] Capacity-Planning pro Person/Sprint", 2,
         "Als PM möchten wir Kapazitäten realistisch verteilen, damit niemand überlastet ist.",
         ["Verfügbarkeit pro Person/Sprint (Vorlesungen, Urlaub)",
          "Story-Point-Cap pro Sprint",
          "Auslastung dokumentiert"],
         "",
         ""),

        ("[Controlling] Quality-Gates: Code-Review + Coverage >=70 + axe-Score", 2,
         "Als Team möchten wir Qualitäts-Gates, damit Spät-Bugs minimiert werden.",
         ["GitHub Branch Protection: 1 Approver + grüne CI",
          "Test-Coverage-Schwelle 70% in CI",
          "axe-Score >=95 für UI-PRs",
          "Lighthouse-Score-Schwelle in CI"],
         "",
         ""),

        ("[Controlling] Tooling-Setup (OpenProject + Confluence/Notion + Slack/WhatsApp)", 2,
         "Als Team brauchen wir verbindliche Tools, damit Information findbar ist.",
         ["OpenProject: Backlog + Sprint-Board",
          "Confluence/Notion: Doku-Hub",
          "Slack/WhatsApp: Async-Kommunikation",
          "Zugriff für alle 12 Mitglieder"],
         "",
         ""),

        ("[Controlling] Wöchentliches Status-Reporting an Dozent", 2,
         "Als PM möchten wir transparente Reports, damit Stakeholder informiert sind.",
         ["Wöchentlicher Status (Highlights, Lowlights, Risiken, Nächste Schritte)",
          "Format harmonisiert",
          "Im Confluence archiviert"],
         "",
         ""),

        ("[Controlling] Compliance-Doku DHBW (Prüfungsleistung)", 2,
         "Als Team müssen wir DHBW-Anforderungen dokumentieren, damit Prüfungsleistung anerkannt wird.",
         ["Pflichtkapitel pro Department aufgelistet",
          "Abgabe-Termin-Plan",
          "Reviewer pro Kapitel"],
         "",
         ""),

        ("[Controlling] DSGVO-Compliance-Audit (Privacy by Design Checkliste)", 3,
         "Als Reflecta müssen wir Privacy-by-Design nachweisen, damit DSGVO erfüllt ist.",
         ["Checkliste alle Datenpfade",
          "Verarbeitungs-Verzeichnis",
          "DPIA falls nötig",
          "Audit-Termin"],
         "",
         ""),

        ("[Controlling] Change-Request-Prozess + Approver-Matrix", 2,
         "Als Team möchten wir geordnete Änderungen, damit Scope-Creep vermieden wird.",
         ["CR-Formular im Confluence",
          "Approver-Matrix (kleine/grosse Änderungen)",
          "Doku im Onboarding"],
         "",
         ""),

        ("[Controlling] Lessons-Learned + Retrospektiven-Aktionspunkte tracken", 1,
         "Als Team möchten wir Verbesserungen umsetzen, damit Sprints besser werden.",
         ["Retro-Aktionspunkte als Tickets im OpenProject",
          "Lessons-Learned-Doku am Projektende"],
         "",
         ""),
    ]
    for subj, sp, story, ac, notes, ref in tasks:
        make_task(parent=eid, subject=subj, sp=sp, assignee="TobiasM",
                  raw=body(story=story, ac=ac, notes=notes, dept=dept, owners=own, ref=ref))


def main() -> None:
    global DRY_RUN
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Don't call API, just print summary")
    args = parser.parse_args()
    DRY_RUN = args.dry_run

    print(f"=== Seeding {'DRY-RUN' if DRY_RUN else 'LIVE'} into project {PROJECT_ID}, version {SPRINT_VERSION_ID} (Sprint 1) ===\n")

    epic_landingpage()
    epic_userforms()
    epic_adminforms()
    epic_backend_app()
    epic_datenmodell()
    epic_marketing()
    epic_brand()
    epic_business()
    epic_controlling()

    print()
    print(f"Created: {CREATED_COUNT['epics']} Epics, {CREATED_COUNT['tasks']} Tasks "
          f"(total {CREATED_COUNT['epics'] + CREATED_COUNT['tasks']})")


if __name__ == "__main__":
    main()
