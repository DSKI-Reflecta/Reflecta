# Reflecta - TODO: Soll vs. Ist

Stand: 2026-05-28. Bezugsrahmen: Animatic + Wireframes (`Abgabe_26_05/`) + 9 OpenProject-Epics aus `scripts/seed_v2.py` (Tickets #257-#436).

Legende: `[x]` fertig (im aktuellen Repo lauffaehig) - `[~]` teilweise da - `[ ]` noch zu bauen.

---

## 1. Landingpage (Epic #257)

- [x] LandingPage.js existiert (`frontend/src/components/pages/LandingPage.js`, 876+ Zeilen)
- [~] Hero/Feature-Sections vorhanden - aber Texte/CTA noch nicht final auf Animatic-Skript
- [ ] **D-00** Globale Navbar mit Sticky + Mobile-Burger nach Wireframe
- [ ] **D-01** Hero-Section mit Animatic-Headline + "Try Live Demo" Primary-CTA
- [ ] **D-02** USP-Bar (3-4 Value-Props mit Icons)
- [ ] **D-03** Feature-Section "Reflektieren" (Animatic-Wording: "der Nutzer schreibt sein Journal")
- [ ] **D-04** Feature-Section "Activities" mit Hover/Tap-Tooltip (Mood-Korrelation)
- [ ] **D-05** Feature-Section "Reflektor AI-Chatbot" inkl. Chat-Preview + Insight-Card
- [ ] **D-06** Feature-Section "Goals" mit AI-Goal-Beispiel
- [ ] **D-07** Feature-Section "Analytics" mit Live-Chart-Preview (Scroll/Hover-Werte)
- [ ] **D-08** Pricing-Section (Free vs Premium, EU/US-Region)
- [ ] **D-09** Footer (Impressum, AGB, Datenschutz, Social, Kontakt)
- [ ] SEO-Metadaten + OG-Image + Sitemap

## 2. User-Forms / App (Epic #277)

Vorhanden:
- [x] JournalPage.js + EntryList/EntryCard/EntryDetail/EntryForm
- [x] GoalPage.js + GoalList/GoalCard/GoalDetail/GoalForm
- [x] CalendarPage.js
- [x] AnalyticsPage.js + AnalyticsDashboard
- [x] AIChat.js + AIButton (FloatingButton)
- [x] LoginPage.js (Cognito-Hosted-UI Stub)

Offen:
- [ ] **USR-00** Onboarding-Flow (Persona-Schritte, erstes Goal, Tone-of-Voice-Pick)
- [ ] **USR-01** Premium-Paywall-Modal (Krone/Lock-Icons in UI)
- [ ] **USR-02** Pricing/Subscription-Settings-Screen mit Stripe-Checkout-Redirect
- [ ] **USR-03** Account-Settings (Region EU/US-Toggle, Datenexport, Konto-Loeschung)
- [ ] **USR-04** Reflexionsfragen-Counter: 3 frei -> dann Paywall
- [ ] **USR-05** Analytics-Range-Lock: 30d frei, 90d/365d + Korrelationen Premium
- [ ] **USR-06** AI-Chatbot-Gate: Premium nur, mit Lock-State fuer Free-User
- [ ] **USR-07** AI-Goal-Generation-Gate: Premium nur
- [ ] **USR-08** Responsive-Tuning aller 8 Screens (768px Breakpoint, Touch-Targets)
- [ ] PWA-Manifest + Service-Worker + Offline-Cache
- [ ] Empty/Loading/Error-States fuer alle 8 Screens
- [ ] WCAG 2.2 AA Audit (axe + manuelles Tab-Order)

## 3. Admin-Forms / Dashboard (Epic #?)

Vorhanden:
- [x] AdminDashboard.js Frontend-Page
- [x] `GET /admin/stats` (Total Users / Active 7d / Total Entries / AI Calls Today / Tokens / Success-Rate)
- [x] `is_admin` Boolean auf UserModel + `get_current_admin` Dependency

Offen:
- [ ] **ADM-00** Erweiterung: Premium-/Free-User-Count, Conversion-Rate, MRR
- [ ] **ADM-00** AI-Cost-Burn pro Tag/Monat (USD aus Token x Provider-Preis)
- [ ] **ADM-00** Profit-Card: MRR - (AI-Cost + Fixkosten)
- [ ] **ADM-00** Pricing-Control-Panel: aktueller Preis, Aenderung loest neues Stripe-Price-Object aus
- [ ] **ADM-00** Audit-Log fuer Pricing-/Fixkosten-Aenderungen (wer/wann/von-bis)
- [ ] AI-Usage-Card: Top-Features + Fehler-Rate + p95-Latenz
- [ ] Privacy-Constraint dokumentieren: keine Inhalts-Einsicht in fremde Tagebuecher

## 4. Backend / App-Logik (Epic #?)

Vorhanden:
- [x] FastAPI + Routes: journal, goal, chatbot, analytics, admin, auth
- [x] Cognito-JWT-Verifizierung (`app/auth/cognito.py` + `dependencies.py`) + DEV_MODE-Fallback
- [x] AI-Client-Abstraktion `ai_client.py` mit `AI_PROVIDER`-Switch (Gemini/Z.ai)
- [x] Concurrent Gemini-Analyse (format/activities/sentiments/goals via ThreadPoolExecutor)
- [x] Chatbot mit Last-10-Entries + Goals als Context
- [x] Analytics Trends/Stats/Korrelationen/Summary
- [x] AI-Usage-Logging (`AIUsageLog`-Tabelle, fuer ADM-00 nutzbar)

Offen:
- [ ] **Subscription-Modell** in DB: `tier` (free/premium), `region` (EU/US), `stripe_customer_id`, `stripe_subscription_id` auf UserModel
- [ ] Premium-Gate-Decorator/Dependency: `require_premium()` fuer Endpoints
- [ ] Reflexionsfragen-Quota: 3/Tag fuer Free, dann 402-Response
- [ ] Analytics-Range-Gate: `?period=` validieren gegen Tier
- [ ] **Stripe-Integration**: Webhook-Handler `/billing/webhook` (subscription.created/updated/deleted), Checkout-Session-Endpoint, Portal-Session-Endpoint
- [ ] EU/US-AI-Provider-Routing: User-Region bestimmt Endpoint (EU=Premium-Modell, US=Free-Modell)
- [ ] Admin-Business-Endpoints: `GET /admin/business-metrics`, `PUT /admin/pricing`, `PUT /admin/fixed-costs`
- [ ] Lambda-Boilerplate (Mangum/AWS-Lambda-Powertools) + Layer-Setup
- [ ] API-Gateway-Mapping + CORS-Policy fuer Production-Domain
- [ ] Rate-Limiting (per User/IP) - momentan keins
- [ ] Tests: pytest fuer Routes, ~70% Coverage

## 5. Datenmodell (Epic #?)

Vorhanden (SQLite/SQLAlchemy):
- [x] UserModel (id, cognito_sub, email, is_admin, created_at)
- [x] JournalEntryModel (+ sentiment/sleep/stress/social, formatted_content, activities, sentiments)
- [x] GoalModel (type, category, priority, progress, target_date)
- [x] journal_goal_association (M:N)
- [x] AnalyticsCacheModel (period, cache_type, content)
- [x] AIUsageLog (feature, model, tokens, success, error_message)

Offen (Ziel: DynamoDB Single-Table):
- [ ] **DynamoDB-Schema final**: PK=`USER#sub`, SK=`ENTRY#date#id` / `GOAL#id` / `META#PROFILE` etc.
- [ ] LSI1-3 (per-User Sortierung: by-date, by-category, by-progress)
- [ ] GSI1-3 (admin/cross-user: by-email, by-tier, by-region)
- [ ] AnalyticsCache-Item mit TTL-Attribut (24h)
- [ ] Quota-Item: `USER#sub#QUOTA#name` -> count + reset_at
- [ ] AIUsageLog -> CloudWatch-Logs + Aggregation in DDB
- [ ] Hard-Delete-Job (taeglich, kaskadiert alle PK USER#sub Items)
- [ ] Repository-Layer abstrahieren (heute SQLAlchemy direkt - DDB-Repo schreiben)
- [ ] Local-DDB (`docker run amazon/dynamodb-local`) fuer Dev

## 6. Marketing (Epic #?)

- [ ] User-Research: WTP-Survey (Willingness to Pay) + DSGVO-Bedenken-Survey
- [ ] Persona-Profile (mind. 3) finalisieren
- [ ] Wettbewerbsanalyse: Day One, Daylio, Reflectly, Stoic
- [ ] Go-to-Market-Plan (Channels: ASO, Reddit, TikTok, DHBW-Netzwerk)
- [ ] Content-Calendar (4 Wochen Pre-Launch)
- [ ] Newsletter-Setup + Lead-Magnet
- [ ] App-Store-/Play-Store-Listings (Texte, Screenshots, Keywords)
- [ ] Paid-Ads-Test-Budget + Tracking-Setup (UTM, Plausible)

## 7. Brand / Design-System (Epic #390)

- [x] Logo-Mark vorhanden (Plus Jakarta Sans + #9B30FF / #6A0DAD aus CLAUDE.md)
- [ ] App-Icon iOS/Android + Favicon (mit Maskable-Variante)
- [ ] Color-Tokens als CSS Vars + Tailwind-Config + JSON Tokens
- [ ] Typografie-Setup Plus Jakarta Sans + Hierarchie-Klassen
- [ ] Spacing/Radius/Shadow-Token-Set + Breakpoint-Definition
- [ ] Emotive Lexicon Icon-Set (8 Zustaende: Joyful..Melancholy)
- [ ] Motion-Library (11 Animations-Events)
- [ ] Komponenten-Library (Buttons, Inputs, Cards, Chips, Modals, Toasts)
- [ ] Pricing-Page-Design + Premium-Badges (Krone/Lock)
- [ ] Onboarding-Flow Illustrationen
- [ ] Empty-State-Illustrationen
- [ ] Marketing-Asset-Templates
- [ ] Tone-of-Voice-Guide
- [ ] A11y-Kontrast-Audit (>=4.5:1 Body, >=3:1 UI)
- [ ] Dark-Mode-Tokens (post-MVP)
- [ ] Storybook + Figma-Library
- [ ] Animatic-Reel/Brand-Video (Hero + Onboarding)

## 8. Business-Modell (Epic #404)

- [ ] Business-Model-Canvas Update mit Monetarisierungs-Hypothese
- [ ] Lean Canvas + Value Proposition Canvas finalisieren
- [ ] Pricing-Modell finalisieren (Monatlich + Jaehrlich, EU/US-Region)
- [ ] Cost-Modeling EU vs US AI-Provider (Tokens x Preis x Volumen)
- [ ] AGB + Widerrufsbelehrung fuer Premium-Abo
- [ ] Datenschutzerklaerung (DSGVO + US-Transfer Art. 49)
- [ ] Impressum (TMG/DDG)
- [ ] AVV-Vertraege mit AWS, Stripe, AI-Providern
- [ ] Rechtsform + Gesellschaftsvertrag (UG/GmbH)
- [ ] Steuerliches Setup (USt, OSS, Reverse-Charge)
- [ ] Versicherung (E&O, Cyber, Berufshaftpflicht)
- [ ] Finanzplan + 24-Monats-Forecast
- [ ] Investor-Pitch-Deck (Seed-Runde)
- [ ] Lizenz-/IP-Strategie
- [ ] Hochschul-/B2B-Lizenzmodell

## 9. Projektcontrolling (Epic #421)

- [x] OpenProject-Backlog gefuellt (179 WPs in Projekt 4, Sprint 1 vorhanden)
- [x] CLAUDE.md (Coding-Conventions)
- [ ] Projekt-Roadmap M1-M6 (KW20-32) finalisieren
- [ ] Sprint-Setup (Laenge, Ceremonies, Kalender)
- [ ] DoR/DoD harmonisieren
- [ ] Risk-Register + monatliches Review
- [ ] Stakeholder-Map + Kommunikationsplan
- [ ] Budget-Tracking + Stunden-Erfassung pro Department
- [ ] Sprint-Burndown + Velocity-Tracking
- [ ] Capacity-Planning pro Person/Sprint
- [ ] Quality-Gates: Code-Review + Coverage >=70 + axe-Score
- [ ] Tooling-Setup (OpenProject + Confluence/Notion + Slack)
- [ ] Woechentliches Status-Reporting an Dozent
- [ ] Compliance-Doku DHBW (Pruefungsleistung)
- [ ] DSGVO-Compliance-Audit (Privacy-by-Design Checkliste)
- [ ] Change-Request-Prozess + Approver-Matrix
- [ ] Lessons-Learned + Retrospektiven-Aktionspunkte tracken

---

## Quick-Wins fuer den Pruefungs-Demo (Prio 1)

1. [ ] **D-05 Reflektor AI-Chatbot Section** auf Landingpage (Animatic-Wording matchen)
2. [ ] **D-04 Activities-Hover-Tooltip** auf Landingpage
3. [ ] **D-08 Pricing-Section** auf Landingpage (mit Free/Premium + EU/US)
4. [ ] **ADM-00 Erweiterung**: Premium-Count + Conversion-Rate + Profit-Card im Admin-Dashboard (Mock-Daten reichen fuer Demo)
5. [ ] **USR-04 Reflexionsfragen-Counter** (3/Tag visualisiert, sichtbarer Free-Limit-Chip)
6. [ ] **USR-06/07 AI-Lock-States** auf Chatbot + AI-Goal-Generator (UI-Lock + Paywall-Modal-Stub)
7. [ ] **`tier` + `region` Felder** auf UserModel + Stripe-Checkout-Stub-Endpoint

## Was fehlt fuer Production (Prio 2)

- [ ] DynamoDB-Migration (Repository-Layer-Refactor)
- [ ] Lambda-Deployment (CDK oder SAM)
- [ ] Stripe-Webhook-Handler real verkabelt
- [ ] PWA-Manifest + Service-Worker
- [ ] Test-Suite (pytest backend + jest frontend) auf >=70% Coverage
- [ ] DSGVO-Audit + Datenschutzerklaerung live
- [ ] Stripe-Live-Mode + Pricing-Control-Panel verkabelt
