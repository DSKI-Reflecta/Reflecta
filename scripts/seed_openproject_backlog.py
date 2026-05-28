"""
Seed OpenProject backlog for Reflecta with Epics (Summary tasks) and Tasks.

OpenProject available types: Task, Milestone, Summary task. We use 'Summary task'
as Epic and 'Task' for stories/subtasks. Parent linkage via _links.parent.

Run:
    OP_TOKEN=opapi-... uv run python scripts/seed_openproject_backlog.py
"""
from __future__ import annotations

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

# Members of the Reflecta project (resolved via /memberships)
USER = {
    "Julian": 36,
    "Bilal": 40,
    "Finn": 39,
    "Chris": 38,
    "Tristan": 35,
    "Srisharanya": 34,
    "TobiasD": 18,
    "TobiasM": 17,
    # not resolvable from member list (anonymous student emails) -> None
    "Simon": None,
    "Jan": None,
    "Daria": None,
    "Andrii": None,
}


def dod_block() -> str:
    return (
        "## Definition of Done\n"
        "- [ ] Code implementiert und lokal lauffaehig\n"
        "- [ ] Unit- bzw. Component-Tests vorhanden und gruen\n"
        "- [ ] Code Review durch mind. 1 weiteres Teammitglied (Pull Request approved)\n"
        "- [ ] Acceptance Criteria nachweislich erfuellt (Demo / Screenshot / Logs)\n"
        "- [ ] Linter / Formatter ohne Fehler\n"
        "- [ ] Doku im Fachkonzept bzw. README aktualisiert\n"
        "- [ ] In Staging deployed und Smoke-Test bestanden\n"
        "- [ ] Product Owner Sign-Off\n"
    )


def make_body(*, story: str, ac: list[str], notes: str = "", department: str, owners: list[str]) -> str:
    ac_md = "\n".join(f"- [ ] {a}" for a in ac)
    body = (
        f"**Department:** {department}\n"
        f"**Verantwortlich:** {', '.join(owners)}\n\n"
        f"## User Story\n{story}\n\n"
        f"## Acceptance Criteria\n{ac_md}\n\n"
    )
    if notes:
        body += f"## Technical Notes\n{notes}\n\n"
    body += dod_block()
    return body


def post_wp(payload: dict) -> dict:
    r = requests.post(f"{BASE}/projects/{PROJECT_ID}/work_packages", auth=AUTH, json=payload, timeout=30)
    if r.status_code >= 400:
        print("ERROR", r.status_code, r.text[:500], file=sys.stderr)
        r.raise_for_status()
    return r.json()


def create_epic(*, subject: str, description: str, owner_id: int | None = None) -> int:
    payload: dict = {
        "subject": subject,
        "description": {"format": "markdown", "raw": description},
        "_links": {
            "type": {"href": f"/api/v3/types/{TYPE_SUMMARY}"},
            "status": {"href": f"/api/v3/statuses/{STATUS_NEW}"},
            "priority": {"href": f"/api/v3/priorities/{PRIO_NORMAL}"},
        },
    }
    if owner_id:
        payload["_links"]["assignee"] = {"href": f"/api/v3/users/{owner_id}"}
    res = post_wp(payload)
    print(f"  EPIC #{res['id']}: {subject}")
    return res["id"]


def create_task(
    *,
    parent_id: int,
    subject: str,
    body: str,
    assignee_id: int | None = None,
    story_points: int = 3,
    priority_id: int = PRIO_NORMAL,
) -> int:
    payload: dict = {
        "subject": subject,
        "description": {"format": "markdown", "raw": body},
        "storyPoints": story_points,
        "_links": {
            "type": {"href": f"/api/v3/types/{TYPE_TASK}"},
            "status": {"href": f"/api/v3/statuses/{STATUS_NEW}"},
            "priority": {"href": f"/api/v3/priorities/{priority_id}"},
            "parent": {"href": f"/api/v3/work_packages/{parent_id}"},
        },
    }
    if assignee_id:
        payload["_links"]["assignee"] = {"href": f"/api/v3/users/{assignee_id}"}
    res = post_wp(payload)
    print(f"    TASK #{res['id']}: {subject} (SP={story_points})")
    return res["id"]


# ---------------------------------------------------------------------------
# Department definitions
# ---------------------------------------------------------------------------

EPICS: list[dict] = [
    # =========================================================================
    {
        "subject": "[EPIC] Frontend-Landingpage",
        "owner": "Chris",
        "description": (
            "**Department:** Frontend-Landingpage\n"
            "**Verantwortlich:** Chris (5681102)\n\n"
            "## Ziel\n"
            "Oeffentlich erreichbare Marketing-Landingpage, die Reflecta vorstellt, "
            "Vertrauen schafft und Besucher zur App-Registrierung konvertiert.\n\n"
            "## Umfasste User Stories\n"
            "Hero, Feature-Sections, Pricing, Testimonials, Datenschutz/Impressum, SEO, Analytics, Konsistenz mit Brand & Design.\n"
        ),
        "tasks": [
            {
                "subject": "[Landingpage] Projekt-Setup (Next.js + Tailwind)",
                "sp": 3,
                "assignee": "Chris",
                "story": "Als Entwickler moechte ich ein sauberes Frontend-Projekt-Setup haben, damit alle Landingpage-Stories darauf aufbauen koennen.",
                "ac": [
                    "Next.js Projekt initialisiert (App Router)",
                    "Tailwind CSS konfiguriert mit Brand-Farben aus Style Guide",
                    "ESLint + Prettier eingerichtet",
                    "CI Build laeuft auf jedem PR",
                ],
                "notes": "Stack-Entscheidung mit Backend-Team abstimmen. Theme-Tokens aus Brand & Design Epic uebernehmen.",
            },
            {
                "subject": "[Landingpage] Hero Section mit CTA",
                "sp": 3,
                "assignee": "Chris",
                "story": "Als Besucher moechte ich beim Aufruf der Seite sofort verstehen, was Reflecta ist, damit ich entscheiden kann ob es fuer mich relevant ist.",
                "ac": [
                    "Headline + Subheadline gemaess Marketing-Copy",
                    "Primaerer CTA-Button 'Kostenlos starten' fuehrt zu /register",
                    "Hintergrundbild oder Animation gemaess Brand Guide",
                    "Mobile responsive (320px - 1920px)",
                ],
            },
            {
                "subject": "[Landingpage] Feature-Sections (Journal, Goals, Analytics, AI)",
                "sp": 5,
                "assignee": "Chris",
                "story": "Als Besucher moechte ich die Kernfunktionen von Reflecta auf einen Blick sehen.",
                "ac": [
                    "4 Feature-Bloecke mit Icon, Headline, Beschreibung",
                    "Screenshots der echten App eingebunden",
                    "Scrollanimation per Intersection Observer",
                ],
            },
            {
                "subject": "[Landingpage] Pricing-Section",
                "sp": 3,
                "assignee": "Chris",
                "story": "Als Besucher moechte ich Preise transparent sehen, damit ich vor der Registrierung Klarheit habe.",
                "ac": [
                    "3 Tiers (Free, Plus, Pro) gemaess Business-Modell Epic",
                    "Toggle Monatlich/Jaehrlich",
                    "CTA pro Tier zu /checkout?plan=...",
                ],
                "notes": "Preise und Features kommen aus Business-Modell Epic. Stripe-Integration in Backend Epic.",
            },
            {
                "subject": "[Landingpage] Testimonials und Social Proof",
                "sp": 2,
                "assignee": "Chris",
                "story": "Als Besucher moechte ich sehen, dass andere Reflecta erfolgreich nutzen.",
                "ac": [
                    "3-5 Testimonials mit Foto/Avatar, Name, Statement",
                    "Logos von erwaehnten Medien/Partnern (falls vorhanden)",
                ],
            },
            {
                "subject": "[Landingpage] Footer mit Impressum, Datenschutz, AGB",
                "sp": 2,
                "assignee": "Chris",
                "story": "Als Betreiber moechte ich rechtskonform Impressum/Datenschutz/AGB verlinken, damit DSGVO/TMG erfuellt sind.",
                "ac": [
                    "Footer mit Links zu /impressum, /datenschutz, /agb",
                    "Inhalte als statische MDX-Seiten gepflegt",
                    "Cookie-Banner mit Opt-In fuer Analytics",
                ],
                "notes": "Texte kommen vom Marketing & Vertrieb Department, juristisch reviewt.",
            },
            {
                "subject": "[Landingpage] SEO-Grundausstattung",
                "sp": 3,
                "assignee": "Chris",
                "story": "Als Marketing-Verantwortlicher moechte ich, dass die Landingpage in Google indexiert wird, damit organischer Traffic entsteht.",
                "ac": [
                    "Meta Title + Description pro Seite",
                    "Open Graph + Twitter Cards",
                    "sitemap.xml und robots.txt generiert",
                    "Lighthouse SEO-Score >= 95",
                ],
            },
            {
                "subject": "[Landingpage] Web Analytics einbinden (Plausible/GA4)",
                "sp": 2,
                "assignee": "Chris",
                "story": "Als Marketing-Verantwortlicher moechte ich Conversion-Funnel messen, damit Marketing-Massnahmen evaluiert werden koennen.",
                "ac": [
                    "Analytics-Tool eingebunden (Plausible bevorzugt, sonst GA4)",
                    "Events fuer CTA-Click, Scroll-Tiefe, Pricing-Toggle",
                    "Cookie-Consent vor Tracking",
                ],
            },
            {
                "subject": "[Landingpage] Deployment auf Vercel/Cloudfront",
                "sp": 3,
                "assignee": "Chris",
                "story": "Als Team moechten wir eine deploybare Landingpage unter reflecta.app erreichbar haben.",
                "ac": [
                    "Hosting-Account angelegt (Vercel oder AWS Cloudfront+S3)",
                    "Custom Domain inkl. TLS konfiguriert",
                    "Auto-Deploy bei Merge auf main",
                ],
                "notes": "Alternativ AWS - dann Static Site auf S3 + Cloudfront, siehe App-Server Epic.",
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Frontend-Userforms",
        "owner": "Julian",
        "description": (
            "**Department:** Frontend-Userforms\n"
            "**Verantwortlich:** Julian Bender (2990570)\n\n"
            "## Ziel\n"
            "Alle Endnutzer-Frontends der App: Auth-Flows, Journal, Goals, Calendar, Analytics, Chatbot, Settings.\n"
            "React-App mit Tailwind und TanStack Query gegen die FastAPI Backend.\n"
        ),
        "tasks": [
            {
                "subject": "[Userforms] Auth-Flow: Registrierung, Login, Passwort-Reset",
                "sp": 8,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich mich registrieren und einloggen koennen, damit meine Tagebucheintraege privat und persistent gespeichert sind.",
                "ac": [
                    "Registrierungs-Form mit Email, Passwort, Passwort-Bestaetigung",
                    "Login-Form mit Email + Passwort",
                    "Passwort-Reset per Email-Link",
                    "JWT/Session im Cookie/Storage abgelegt, Auto-Refresh",
                    "Protected Routes leiten unauthenticated auf /login um",
                ],
                "notes": "Backend liefert /auth/register, /auth/login, /auth/refresh - siehe App-Server Epic.",
            },
            {
                "subject": "[Userforms] Journal-Eintrag erstellen und bearbeiten",
                "sp": 5,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich Tagebucheintraege schreiben und ueberarbeiten, damit ich meine Gedanken festhalten kann.",
                "ac": [
                    "Editor mit Titel, Datum, Freitext, Mood-Slider",
                    "Speichern triggert POST /journal/entries und zeigt AI-Analyse",
                    "Edit eines existierenden Eintrags (PUT /journal/entries/{id})",
                    "Auto-Save Draft im LocalStorage",
                ],
            },
            {
                "subject": "[Userforms] Journal-Liste mit Filter und Suche",
                "sp": 3,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich meine Eintraege durchsuchen und filtern, damit ich vergangene Reflexionen wiederfinde.",
                "ac": [
                    "Liste mit Pagination (TanStack Query)",
                    "Volltextsuche im Frontend (oder via Backend-Param)",
                    "Filter nach Sentiment, Aktivitaet, Datum",
                ],
            },
            {
                "subject": "[Userforms] Goals-Page (CRUD)",
                "sp": 5,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich Ziele anlegen, bearbeiten und abhaken, damit ich meine Entwicklung sehe.",
                "ac": [
                    "Create-Form fuer Goals mit Name, Beschreibung, Zieldatum, Kategorie",
                    "Liste mit Status-Toggle und Progress-Bar",
                    "AI-Enhance-Button ruft /goals/enhance auf",
                    "Loeschen mit Confirmation",
                ],
            },
            {
                "subject": "[Userforms] Calendar View",
                "sp": 5,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich meine Eintraege in einem Kalender visualisiert sehen, damit ich Muster erkenne.",
                "ac": [
                    "Monatsansicht mit Heatmap (Mood-basiert)",
                    "Klick auf Tag oeffnet Eintrag-Detail",
                    "Vor/Zurueck-Navigation",
                ],
            },
            {
                "subject": "[Userforms] Analytics-Dashboard",
                "sp": 5,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich meine Daten ueber Zeit visualisiert sehen, damit ich Trends im Wohlbefinden erkenne.",
                "ac": [
                    "Charts fuer Sentiment, Sleep, Stress, Social Engagement (Recharts)",
                    "Zeitfilter Woche/Monat/Quartal/Jahr",
                    "Korrelations-Heatmap",
                    "Streaks-Anzeige",
                ],
                "notes": "Daten kommen von /analytics/* Endpunkten.",
            },
            {
                "subject": "[Userforms] Chatbot-Widget",
                "sp": 3,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich mit einem AI-Coach chatten, damit ich Reflexionsimpulse bekomme.",
                "ac": [
                    "Chat-UI mit Verlauf, Eingabefeld, Streaming-Antworten",
                    "POST /ai/chat mit user_message",
                    "Loading- und Error-States",
                ],
            },
            {
                "subject": "[Userforms] Settings (Profil, Passwort, Benachrichtigungen, Datenexport)",
                "sp": 5,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich mein Profil und meine Praeferenzen verwalten koennen.",
                "ac": [
                    "Profil-Editor (Name, Email)",
                    "Passwort aendern",
                    "Push/Email-Benachrichtigungs-Praeferenzen",
                    "Daten-Export als JSON (DSGVO)",
                    "Account-Loeschung",
                ],
            },
            {
                "subject": "[Userforms] Onboarding-Flow",
                "sp": 3,
                "assignee": "Julian",
                "story": "Als Neu-Nutzer moechte ich nach Registrierung durch die App gefuehrt werden, damit ich schnell den Wert verstehe.",
                "ac": [
                    "3-5 Step Onboarding-Tour",
                    "Erstes Goal anlegen lassen",
                    "Ersten Eintrag schreiben lassen",
                    "Ueberspringbar, einmalig",
                ],
            },
            {
                "subject": "[Userforms] PWA Setup + Offline-Support",
                "sp": 3,
                "assignee": "Julian",
                "story": "Als Nutzer moechte ich Reflecta auf dem Phone wie eine App nutzen, auch ohne stabile Verbindung.",
                "ac": [
                    "manifest.json + Service Worker",
                    "Installation auf Mobile/Desktop moeglich",
                    "Offline-Cache fuer letzte 30 Eintraege",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Frontend-Adminforms",
        "owner": "Finn",
        "description": (
            "**Department:** Frontend-Adminforms\n"
            "**Verantwortlich:** Finn Renzenbrink (8533720)\n\n"
            "## Ziel\n"
            "Internes Admin-Backoffice fuer Support, User-Management, Content-Moderation und Operations.\n"
        ),
        "tasks": [
            {
                "subject": "[Admin] Admin-Login und Rollen-Check",
                "sp": 3,
                "assignee": "Finn",
                "story": "Als Admin moechte ich mich separat anmelden und nur als Admin Zugriff bekommen.",
                "ac": [
                    "Login-Route /admin/login",
                    "Rolle 'admin' im JWT/Backend-Check",
                    "Non-Admins werden mit 403 abgewiesen",
                ],
            },
            {
                "subject": "[Admin] User-Management (Liste, Suche, Sperren)",
                "sp": 5,
                "assignee": "Finn",
                "story": "Als Admin moechte ich User durchsuchen und ggf. sperren, damit ich Support leisten und Missbrauch verhindern kann.",
                "ac": [
                    "Tabelle aller User mit Status, Plan, Created-At",
                    "Suche nach Email/Name",
                    "Aktionen: Sperren, Entsperren, Loeschen, Plan aendern",
                ],
            },
            {
                "subject": "[Admin] Subscription / Billing Overview",
                "sp": 3,
                "assignee": "Finn",
                "story": "Als Admin moechte ich Abos und Zahlungsstatus einsehen.",
                "ac": [
                    "Liste der aktiven Subscriptions",
                    "Filter nach Status (active, past_due, canceled)",
                    "Drill-Down auf Stripe-Customer",
                ],
                "notes": "Daten via Backend-Adapter aus Stripe API.",
            },
            {
                "subject": "[Admin] Content-Moderation (Reports)",
                "sp": 3,
                "assignee": "Finn",
                "story": "Als Admin moechte ich gemeldete Inhalte pruefen koennen.",
                "ac": [
                    "Liste reportierter Eintraege/Kommentare",
                    "Aktionen: zulassen, loeschen, User warnen",
                ],
            },
            {
                "subject": "[Admin] System-Health Dashboard",
                "sp": 3,
                "assignee": "Finn",
                "story": "Als Admin moechte ich System-Metriken auf einen Blick sehen.",
                "ac": [
                    "Anzeige Backend-Health, DB-Health, Gemini-Health",
                    "Letzte Fehler-Logs (top 50)",
                    "Anzahl aktiver User / heute / gesamt",
                ],
            },
            {
                "subject": "[Admin] Audit-Log",
                "sp": 3,
                "assignee": "Finn",
                "story": "Als Admin moechte ich nachvollziehen, welche Admin-Aktion wann gemacht wurde.",
                "ac": [
                    "Tabelle aller Admin-Aktionen mit User, Aktion, Zeit, Ziel",
                    "Filter, Pagination, Export als CSV",
                ],
            },
            {
                "subject": "[Admin] Feature-Flags Management",
                "sp": 3,
                "assignee": "Finn",
                "story": "Als Admin moechte ich Features pro Plan/User togglen, ohne Deploy.",
                "ac": [
                    "Liste vorhandener Flags",
                    "Toggle global oder pro User-Segment",
                    "Audit-Eintrag bei Aenderung",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Backend-ApplicationServer",
        "owner": "Bilal",
        "description": (
            "**Department:** Backend-ApplicationServer\n"
            "**Verantwortlich:** Bilal El Hasnaoui (9333793), Simon (4898928)\n\n"
            "## Ziel\n"
            "FastAPI Backend, AWS Deployment, Auth, AI-Integration, Monetarisierung, Notifications, Operations.\n"
        ),
        "tasks": [
            {
                "subject": "[Backend] Auth-Service (Register/Login/JWT/Refresh)",
                "sp": 8,
                "assignee": "Bilal",
                "story": "Als System brauchen wir Authentifizierung, damit Nutzerdaten privat sind.",
                "ac": [
                    "POST /auth/register, /auth/login, /auth/refresh, /auth/logout",
                    "Passwort-Hashing mit Argon2/bcrypt",
                    "JWT (access 15min, refresh 30d)",
                    "Email-Verifikation per Token-Link",
                    "Rate-Limit auf Login-Endpoint",
                ],
            },
            {
                "subject": "[Backend] Passwort-Reset Flow + Mail-Versand",
                "sp": 3,
                "assignee": "Simon",
                "story": "Als Nutzer moechte ich mein Passwort zuruecksetzen, falls ich es vergessen habe.",
                "ac": [
                    "POST /auth/password/forgot mit Token-Generierung",
                    "Mail-Versand via SES oder SMTP-Provider",
                    "POST /auth/password/reset mit Token-Validierung",
                ],
                "notes": "Mail-Provider Account (AWS SES bevorzugt) muss eingerichtet sein - siehe Operations.",
            },
            {
                "subject": "[Backend] Journal CRUD + AI-Analyse",
                "sp": 5,
                "assignee": "Bilal",
                "story": "Als System sollen Journal-Eintraege persistiert und durch Gemini analysiert werden.",
                "ac": [
                    "POST/GET/PUT/DELETE /journal/entries",
                    "Bei Create: parallele Gemini-Calls (format, activities, sentiments, goals)",
                    "Strukturierte Pydantic-Schemas fuer Gemini-Output",
                    "Tests fuer alle Endpunkte",
                ],
            },
            {
                "subject": "[Backend] Goals CRUD + AI-Enhance",
                "sp": 3,
                "assignee": "Simon",
                "story": "Als System sollen Goals verwaltet und ggf. AI-verfeinert werden.",
                "ac": [
                    "/goals/* Endpunkte komplett (CRUD)",
                    "/goals/enhance ruft Gemini fuer SMART-Verfeinerung",
                    "/goals/recommend liefert Vorschlaege basierend auf letzten Eintraegen",
                ],
            },
            {
                "subject": "[Backend] Chatbot-Endpoint mit Kontext-Injection",
                "sp": 3,
                "assignee": "Bilal",
                "story": "Als System soll der Chatbot mit Wissen ueber letzte Eintraege und Goals antworten.",
                "ac": [
                    "POST /ai/chat",
                    "Letzte 10 Eintraege + alle Goals als Kontext",
                    "Streaming-Antwort (SSE) optional",
                ],
            },
            {
                "subject": "[Backend] Analytics-Endpoints",
                "sp": 5,
                "assignee": "Simon",
                "story": "Als System sollen aggregierte Statistiken berechnet werden.",
                "ac": [
                    "GET /analytics/summary, /trends, /correlations, /stats",
                    "Period-Param (week/month/quarter/year)",
                    "Server-Side Caching (Redis oder in-memory) fuer 5min",
                ],
            },
            {
                "subject": "[Backend] Stripe-Integration fuer Monetarisierung",
                "sp": 8,
                "assignee": "Bilal",
                "story": "Als Betreiber moechten wir Plaene verkaufen koennen.",
                "ac": [
                    "Stripe-Account angelegt, Test+Live Keys konfiguriert",
                    "Produkte und Preise in Stripe definiert",
                    "POST /billing/checkout-session",
                    "Webhook /billing/webhook (signature-validiert)",
                    "Subscription-Status auf User persistiert",
                    "Cancel- und Upgrade-Flow",
                ],
                "notes": "Stripe-Webhook-Secret in AWS Secrets Manager. PCI-Pflichten via Stripe Hosted Checkout abgedeckt.",
            },
            {
                "subject": "[Backend] Daily/Weekly Reminder Push + Email",
                "sp": 3,
                "assignee": "Simon",
                "story": "Als Nutzer moechte ich Erinnerungen, damit ich regelmaessig journale.",
                "ac": [
                    "Cron-Job (Lambda Scheduled Event) prueft Praeferenzen",
                    "Mail via SES; Web-Push via VAPID Keys",
                    "User kann Praeferenzen togglen",
                ],
            },
            {
                "subject": "[Backend] DSGVO Daten-Export und Account-Loeschung",
                "sp": 3,
                "assignee": "Bilal",
                "story": "Als Nutzer moechte ich meine Daten exportieren oder loeschen koennen.",
                "ac": [
                    "GET /me/export liefert ZIP mit JSON aller Eintraege+Goals",
                    "DELETE /me loescht User-Datensatz inkl. Stripe-Cancel",
                    "Audit-Log Eintrag",
                ],
            },
            {
                "subject": "[Ops] AWS-Account und IAM-Setup",
                "sp": 3,
                "assignee": "Bilal",
                "story": "Als Team brauchen wir einen AWS-Account und Rollen.",
                "ac": [
                    "AWS-Account angelegt mit MFA-Root",
                    "IAM-User je Teammember mit Least-Privilege",
                    "Billing Alerts konfiguriert",
                ],
            },
            {
                "subject": "[Ops] Backend-Deployment auf AWS Lambda + API Gateway",
                "sp": 8,
                "assignee": "Simon",
                "story": "Als Team wollen wir das FastAPI Backend serverless deployen.",
                "ac": [
                    "Mangum-Adapter fuer FastAPI->Lambda",
                    "Lambda-Funktion via SAM oder Terraform definiert",
                    "API Gateway HTTP API als Eingang",
                    "Custom Domain api.reflecta.app + ACM-Cert",
                    "CloudWatch Logs aktiv",
                ],
                "notes": "Alternative: ECS Fargate falls cold-start kritisch.",
            },
            {
                "subject": "[Ops] Gemini API Key in AWS Secrets Manager",
                "sp": 2,
                "assignee": "Bilal",
                "story": "Als Team wollen wir Credentials sicher und rotierbar lagern.",
                "ac": [
                    "Secret 'reflecta/prod/gemini-api-key' angelegt",
                    "Lambda-Rolle hat secretsmanager:GetSecretValue auf dieses Secret",
                    "Code laedt Key zur Laufzeit, nicht aus .env",
                    "Prozess fuer Rotation dokumentiert",
                ],
            },
            {
                "subject": "[Ops] CI/CD Pipeline (GitHub Actions)",
                "sp": 5,
                "assignee": "Simon",
                "story": "Als Team wollen wir bei jedem Merge automatisch testen und deployen.",
                "ac": [
                    "Workflow: lint, test, build auf jedem PR",
                    "Auf main: Deploy zu Staging",
                    "Manueller Approval-Gate fuer Prod-Deploy",
                    "Slack-Notification bei Erfolg/Fehler",
                ],
            },
            {
                "subject": "[Ops] Monitoring + Alerting (CloudWatch + Sentry)",
                "sp": 3,
                "assignee": "Bilal",
                "story": "Als Team wollen wir Fehler und Latenzen sehen, bevor User berichten.",
                "ac": [
                    "Sentry SDK in FastAPI eingebunden",
                    "CloudWatch Dashboards fuer Latenzen, Errors, Cold Starts",
                    "Alarme: Error-Rate > 1%, p95-Latenz > 1500ms",
                ],
            },
            {
                "subject": "[Ops] Rate Limiting + WAF",
                "sp": 3,
                "assignee": "Simon",
                "story": "Als Team wollen wir uns gegen Missbrauch und Brute-Force schuetzen.",
                "ac": [
                    "AWS WAF vor API Gateway mit OWASP Core Ruleset",
                    "Rate-Limit pro IP und pro User (z.B. 60 req/min)",
                    "Tests dokumentiert",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Backend-Datenmodell",
        "owner": "Tristan",
        "description": (
            "**Department:** Backend-Datenmodell\n"
            "**Verantwortlich:** Tristan Zell (5967670), Jan (7962446)\n\n"
            "## Ziel\n"
            "Persistenz, Schemas, Migrations, Backups. SQLite/Postgres im Backend, "
            "verbindlich konsistent mit den Pydantic-Schemas.\n"
        ),
        "tasks": [
            {
                "subject": "[DB] Datenmodell finalisieren (User, JournalEntry, Goal, Subscription, AuditLog)",
                "sp": 5,
                "assignee": "Tristan",
                "story": "Als Team brauchen wir ein vollstaendiges, abgestimmtes Datenmodell, damit alle Features tragen.",
                "ac": [
                    "ER-Diagramm aktualisiert",
                    "User, JournalEntry, Goal, Subscription, AuditLog, NotificationPreference modelliert",
                    "Many-to-many JournalEntry<->Goal beruecksichtigt",
                    "Review mit Backend-Team",
                ],
            },
            {
                "subject": "[DB] Migration auf Postgres (von SQLite)",
                "sp": 5,
                "assignee": "Jan",
                "story": "Als Team brauchen wir eine produktionsreife relationale DB, damit Concurrent Access und Backups robust sind.",
                "ac": [
                    "Postgres-Instanz auf AWS RDS aufgesetzt",
                    "Connection-String via Secrets Manager",
                    "Lokale dev-DB optional via docker-compose",
                    "App laeuft gegen Postgres in Staging",
                ],
            },
            {
                "subject": "[DB] Alembic Migrations einfuehren",
                "sp": 3,
                "assignee": "Tristan",
                "story": "Als Team wollen wir Schema-Aenderungen versioniert und reversibel ausrollen.",
                "ac": [
                    "Alembic initialisiert",
                    "Initial Migration aus aktuellen Models generiert",
                    "CI-Step: alembic upgrade head + downgrade base klappt",
                ],
            },
            {
                "subject": "[DB] Indexe und Performance-Tuning",
                "sp": 3,
                "assignee": "Jan",
                "story": "Als System brauchen wir performante Queries auf Eintraegen und Analytics.",
                "ac": [
                    "Indexe auf (user_id, created_at) fuer JournalEntry",
                    "Composite-Index fuer Goal-Queries",
                    "EXPLAIN-Plaene fuer kritische Queries dokumentiert",
                ],
            },
            {
                "subject": "[DB] Backups und Restore-Test",
                "sp": 3,
                "assignee": "Tristan",
                "story": "Als Betreiber wollen wir Datenverlust ausschliessen.",
                "ac": [
                    "Automated daily snapshots auf RDS",
                    "Retention 30 Tage",
                    "Restore-Drill dokumentiert (mind. einmalig durchgefuehrt)",
                ],
            },
            {
                "subject": "[DB] DSGVO Datenloeschung sauber kaskadieren",
                "sp": 3,
                "assignee": "Jan",
                "story": "Als Team muessen wir bei Account-Loeschung saemtliche Personenbezugsdaten entfernen.",
                "ac": [
                    "ON DELETE CASCADE wo sinnvoll",
                    "Soft-Delete fuer AuditLog mit Pseudonymisierung",
                    "Test: nach DELETE /me sind keine Records mehr fuer den User auffindbar",
                ],
            },
            {
                "subject": "[DB] Seed-Skripte und Demo-Daten",
                "sp": 2,
                "assignee": "Tristan",
                "story": "Als Entwickler moechte ich realistische Demodaten zum Testen haben.",
                "ac": [
                    "Skript erzeugt N User mit M Eintraegen und Goals",
                    "Idempotent (clear+seed)",
                    "Im docker-compose nutzbar",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Marketing & Vertrieb",
        "owner": None,
        "description": (
            "**Department:** Marketing & Vertrieb\n"
            "**Verantwortlich:** Daria (2036658), Srisharanya Vobblisetty (4454610)\n\n"
            "## Ziel\n"
            "Go-To-Market: Positionierung, Content, Kampagnen, KPIs.\n"
        ),
        "tasks": [
            {
                "subject": "[M&V] Zielgruppen-Personas finalisieren",
                "sp": 3,
                "assignee": "Daria",
                "story": "Als Team brauchen wir 2-3 detaillierte Personas, damit Botschaften zielgruppengerecht sind.",
                "ac": [
                    "Mind. 3 Personas mit Demographics, Pain Points, Goals, Channels",
                    "Validation durch 5 Kurzinterviews",
                ],
            },
            {
                "subject": "[M&V] Marketing-Copy Landingpage",
                "sp": 3,
                "assignee": "Srisharanya",
                "story": "Als Team brauchen wir verkaufsstarke Texte fuer alle Landingpage-Sections.",
                "ac": [
                    "Hero, Features, Pricing, FAQ, Footer-Texte",
                    "DE und EN Variante",
                    "Tonalitaet stimmt mit Brand Guide ueberein",
                ],
            },
            {
                "subject": "[M&V] Social-Media Launch-Plan",
                "sp": 3,
                "assignee": "Daria",
                "story": "Als Team wollen wir einen 6-Wochen Launch-Plan fuer Instagram/TikTok/LinkedIn.",
                "ac": [
                    "Content-Kalender mit Themen pro Woche",
                    "10 Post-Vorlagen designed (in Brand & Design Epic)",
                    "Tools fuer Scheduling ausgewaehlt",
                ],
            },
            {
                "subject": "[M&V] SEO-Keyword-Recherche",
                "sp": 3,
                "assignee": "Srisharanya",
                "story": "Als Team brauchen wir priorisierte Keywords fuer Content und Meta-Tags.",
                "ac": [
                    "Top 30 Keywords mit Volume und Konkurrenz",
                    "Mapping zu Landingpage-Sections",
                    "Content-Briefs fuer 5 Blog-Artikel",
                ],
            },
            {
                "subject": "[M&V] Email-Marketing Setup",
                "sp": 3,
                "assignee": "Daria",
                "story": "Als Team wollen wir Newsletter und Drip-Kampagnen versenden.",
                "ac": [
                    "ESP ausgewaehlt (z.B. Mailchimp/Brevo) und Account angelegt",
                    "Welcome-Sequence (3 Mails) erstellt",
                    "DOI-Form auf Landingpage angebunden",
                ],
            },
            {
                "subject": "[M&V] KPI-Dashboard und Reporting",
                "sp": 2,
                "assignee": "Srisharanya",
                "story": "Als Team wollen wir Marketing-Erfolg messen.",
                "ac": [
                    "KPIs definiert (Visits, Signups, CAC, Aktivierungsquote)",
                    "Dashboard in Plausible/GA + Sheet",
                    "Wochenreport-Template",
                ],
            },
            {
                "subject": "[M&V] Pressemitteilung und Outreach",
                "sp": 2,
                "assignee": "Daria",
                "story": "Als Team wollen wir Launch-Awareness in Tech-Medien generieren.",
                "ac": [
                    "Pressemitteilung formuliert (DE/EN)",
                    "Liste 20 relevanter Journalisten/Newsletter",
                    "Outreach-Mails versendet",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Brand & Design",
        "owner": None,
        "description": (
            "**Department:** Brand & Design\n"
            "**Verantwortlich:** Andrii (2349199)\n\n"
            "## Ziel\n"
            "Markenidentitaet, Style Guide, UI Kit, Assets fuer App und Marketing.\n"
        ),
        "tasks": [
            {
                "subject": "[Brand] Logo-Finalisierung in allen Varianten",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Team brauchen wir Logo-Assets fuer alle Kontexte.",
                "ac": [
                    "Logo SVG, PNG (1x/2x/3x), Favicon",
                    "Hell- und Dunkelvariante",
                    "App-Icon iOS/Android Sizes",
                ],
            },
            {
                "subject": "[Brand] Style Guide (Farben, Typo, Spacing) als Tokens",
                "sp": 5,
                "assignee": "Andrii",
                "story": "Als Frontend-Team brauchen wir Design-Tokens, damit App und Landingpage konsistent sind.",
                "ac": [
                    "Tokens als JSON oder Tailwind-Config",
                    "Light + Dark Theme",
                    "Doku im Notion/Storybook",
                ],
            },
            {
                "subject": "[Brand] UI Kit in Figma (Buttons, Forms, Cards, Charts)",
                "sp": 5,
                "assignee": "Andrii",
                "story": "Als Designer/Entwickler wollen wir wiederverwendbare Komponenten in Figma haben.",
                "ac": [
                    "Komponentenbibliothek in Figma",
                    "States (default/hover/disabled/error) abgedeckt",
                    "Verbunden mit Style Guide Tokens",
                ],
            },
            {
                "subject": "[Brand] Illustrations und Iconography",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Team brauchen wir konsistente Illustrationen und Icons.",
                "ac": [
                    "Icon-Set (>= 30 Icons) im einheitlichen Stil",
                    "3-5 Hauptillustrationen fuer Onboarding/Empty States",
                ],
            },
            {
                "subject": "[Brand] Marketing-Assets (Social Media Templates)",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Marketing-Team brauchen wir wiederverwendbare Templates.",
                "ac": [
                    "10 Post-Templates in 1080x1080, 1080x1920",
                    "Editierbar in Canva/Figma",
                ],
            },
            {
                "subject": "[Brand] Animatic / Motion Spec",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Team wollen wir konsistente Mikro-Animationen in der App.",
                "ac": [
                    "Spec fuer Easings, Durations, Hover/Tap-Feedback",
                    "Lottie-Files fuer Loading + Success States",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Business-Modell",
        "owner": None,
        "description": (
            "**Department:** Business-Modell\n"
            "**Verantwortlich:** Andrii (2349199)\n\n"
            "## Ziel\n"
            "Business Model Canvas, Pricing, Monetarisierung, Finanzplanung, Compliance-Framework.\n"
        ),
        "tasks": [
            {
                "subject": "[Business] Business Model Canvas final",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Team brauchen wir ein konsolidiertes BMC, damit Strategie klar ist.",
                "ac": [
                    "9 BMC-Felder befuellt und validiert",
                    "Reviewt mit Marketing+Backend",
                ],
            },
            {
                "subject": "[Business] Pricing-Strategie (Free/Plus/Pro)",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Team brauchen wir eine begruendete Preis-Struktur.",
                "ac": [
                    "3 Tiers definiert mit Feature-Matrix",
                    "Wettbewerbsanalyse (5 Konkurrenten)",
                    "A/B-Testing-Hypothesen dokumentiert",
                ],
            },
            {
                "subject": "[Business] Finanzplanung (5J Forecast)",
                "sp": 5,
                "assignee": "Andrii",
                "story": "Als Team brauchen wir Annahmen zu Kosten, Umsatz, Break-Even.",
                "ac": [
                    "Excel/Sheet mit Umsatz-/Kosten-Forecast 5 Jahre",
                    "Sensitivity-Analyse (Best/Realistic/Worst)",
                    "Break-Even-Punkt benannt",
                ],
            },
            {
                "subject": "[Business] DSGVO-Konzept und AVV",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Betreiber brauchen wir DSGVO-konforme Prozesse.",
                "ac": [
                    "Verzeichnis Verarbeitungstaetigkeiten",
                    "AV-Vertrag mit Google/Stripe/AWS abgeschlossen",
                    "Datenschutzerklaerung verlinkt",
                ],
            },
            {
                "subject": "[Business] AGB und Impressum",
                "sp": 2,
                "assignee": "Andrii",
                "story": "Als Betreiber brauchen wir rechtssichere AGB und Impressum.",
                "ac": [
                    "AGB-Entwurf juristisch abgenommen",
                    "Impressum mit allen Pflichtangaben",
                    "Versionierung fuer aenderungen",
                ],
            },
            {
                "subject": "[Business] Monetarisierungs-Roadmap",
                "sp": 3,
                "assignee": "Andrii",
                "story": "Als Team brauchen wir eine Roadmap fuer Monetarisierungs-Hebel ueber 12 Monate.",
                "ac": [
                    "Hebel: Subscription, B2B-Lizenzen, In-App-Coaching",
                    "Priorisiert nach Aufwand vs. Impact",
                    "Verzahnt mit Product-Roadmap",
                ],
            },
        ],
    },
    # =========================================================================
    {
        "subject": "[EPIC] Projektcontrolling",
        "owner": "TobiasM",
        "description": (
            "**Department:** Projektcontrolling\n"
            "**Verantwortlich:** Tobias Meier (9674989), Tobias Dietze (6794045)\n\n"
            "## Ziel\n"
            "Projektsteuerung, Reporting, Risikomanagement, Qualitaetssicherung.\n"
        ),
        "tasks": [
            {
                "subject": "[PC] Projektstrukturplan und Meilensteine",
                "sp": 3,
                "assignee": "TobiasM",
                "story": "Als PM brauchen wir eine PSP+Meilenstein-Plan, damit Termine klar sind.",
                "ac": [
                    "PSP in OpenProject als Summary-Tasks",
                    "5-7 Meilensteine mit Datum",
                    "Gantt-View geprueft",
                ],
            },
            {
                "subject": "[PC] Risikoregister",
                "sp": 2,
                "assignee": "TobiasD",
                "story": "Als PM wollen wir Risiken sichtbar und mitigiert haben.",
                "ac": [
                    "Mind. 10 Risiken mit Wahrscheinlichkeit/Impact",
                    "Mitigation pro Risiko",
                    "Wochenupdate",
                ],
            },
            {
                "subject": "[PC] Statusreporting (woechentlich)",
                "sp": 2,
                "assignee": "TobiasM",
                "story": "Als Stakeholder wollen wir wissen, wo das Projekt steht.",
                "ac": [
                    "Template fuer Wochenreport (Ampelstatus, Achievements, Blocker, Next)",
                    "Versendet an alle Departments",
                    "Archiviert",
                ],
            },
            {
                "subject": "[PC] Sprint-Planning + Retro Termine",
                "sp": 2,
                "assignee": "TobiasD",
                "story": "Als PM wollen wir Scrum-Zeremonien etablieren.",
                "ac": [
                    "Sprint-Planning, Daily, Review, Retro im Kalender",
                    "Definition of Ready+Done als Anhang",
                    "Erste Retro durchgefuehrt mit Action Items",
                ],
            },
            {
                "subject": "[PC] Budget-Controlling",
                "sp": 3,
                "assignee": "TobiasM",
                "story": "Als PM wollen wir Soll-Ist Vergleiche pro Department.",
                "ac": [
                    "Budget je Department definiert",
                    "Monatliches Tracking gegen Plan",
                    "Eskalationspfad bei >10% Abweichung",
                ],
            },
            {
                "subject": "[PC] Qualitaetssicherung (Acceptance-Tests)",
                "sp": 3,
                "assignee": "TobiasD",
                "story": "Als PM wollen wir vor Sprint-Ende Akzeptanztests durchfuehren.",
                "ac": [
                    "Test-Cases pro User Story",
                    "Test-Run vor Sprint Review",
                    "Bug-Tickets bei Fehlern erstellt",
                ],
            },
            {
                "subject": "[PC] Lessons Learned und Doku-Konsolidierung",
                "sp": 2,
                "assignee": "TobiasM",
                "story": "Als Team wollen wir am Ende lernen und alles uebergabefaehig bereitstellen.",
                "ac": [
                    "Workshop am Sprint-Ende",
                    "Top 5 Learnings persistiert",
                    "Doku-Index ueber alle Departments",
                ],
            },
        ],
    },
]


def main() -> None:
    print(f"Seeding {len(EPICS)} Epics with sub-tasks into project {PROJECT_ID} ...")
    summary: list[tuple[str, int, list[int]]] = []
    for epic in EPICS:
        owner_id = USER.get(epic["owner"]) if epic.get("owner") else None
        epic_id = create_epic(
            subject=epic["subject"],
            description=epic["description"],
            owner_id=owner_id,
        )
        task_ids: list[int] = []
        for t in epic["tasks"]:
            assignee_id = USER.get(t.get("assignee", "")) if t.get("assignee") else None
            owners_label = [t["assignee"]] if t.get("assignee") else ["unassigned"]
            body = make_body(
                story=t["story"],
                ac=t["ac"],
                notes=t.get("notes", ""),
                department=epic["subject"].replace("[EPIC] ", ""),
                owners=owners_label,
            )
            tid = create_task(
                parent_id=epic_id,
                subject=t["subject"],
                body=body,
                assignee_id=assignee_id,
                story_points=t["sp"],
            )
            task_ids.append(tid)
            time.sleep(0.05)
        summary.append((epic["subject"], epic_id, task_ids))
    print("\n=== Summary ===")
    total_tasks = 0
    for subj, eid, tids in summary:
        print(f"  #{eid} {subj}  -> {len(tids)} tasks")
        total_tasks += len(tids)
    print(f"\nTotal: {len(summary)} epics, {total_tasks} tasks.")


if __name__ == "__main__":
    main()
