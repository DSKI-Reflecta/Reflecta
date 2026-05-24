# Fachkonzept Frontend-Userforms · Inhalts-Spec

Stand: 2026-05-24
Department: Frontend-Userforms
Zielformat: HTML-Quelle nach Vorbild von `admin_fachkonzept.html`, im zweiten Schritt per `capture.js` zu PDF gerendert
Zweck dieses Dokuments: vollständiger Inhaltsplan für das Fachkonzept des authentifizierten Produktbereichs. Dient als Quelle für die spätere HTML-Umsetzung und als Review-Artefakt.

---

## Cover

- Titel: Fachkonzept der User-Masken
- Untertitel: Use Cases, Dialogliste, Informationsarchitektur, Swimlane-Ablaufdiagramme, ISO-9241-110-Bewertung und annotierte Wireframes des authentifizierten Produktbereichs der Reflecta-Plattform
- Projekt: Reflecta
- Datum: 24.05.2026
- Mitarbeiter: TBD (Matrikelnummer)

## Inhaltsverzeichnis

1. Geltungsbereich und Konventionen
2. Use Cases
3. Dialogliste
4. Informationsarchitektur
5. Swimlane-Ablaufdiagramme
   - 5.1 Flow A: Tageseintrag erfassen mit KI-Analyse
   - 5.2 Flow B: Ziel mit KI-Empfehlung anlegen
   - 5.3 Flow C: Validierungsfehler im Entry Form
6. ISO 9241-110 Bewertung
7. Zustände und Validierung
8. Annotierte Wireframes
   - 8.1 USR-01 Journal Overview
   - 8.2 USR-03 Entry Form Modal
   - 8.3 USR-02 Entry Detail Modal
   - 8.4 USR-04 Goals Overview mit KI-Empfehlungen
   - 8.5 USR-06 Goal Form Modal mit KI-Verfeinerung
   - 8.6 USR-05 Goal Detail Modal
   - 8.7 USR-07 Calendar View mit Day-Detail
   - 8.8 USR-08 Analytics Dashboard

---

## Dokumentübersicht (Einleitungstext)

Dieses Dokument spezifiziert den authentifizierten Produktbereich von Reflecta. Es beschreibt die User-Masken, durch die Nutzer ihre Tageseinträge erfassen, persönliche Ziele pflegen, Verläufe im Kalender nachvollziehen und ihr Wohlbefinden in der Analytics-Ansicht auswerten. Im Unterschied zum Fachkonzept Admin-Bereich und zum Fachkonzept Landingpage liegt der Schwerpunkt auf Usability. Nach der Dialogliste und der Informationsarchitektur folgen drei Swimlane-Flows, eine systematische Bewertung gegen die sieben Dialogprinzipien der ISO 9241-110, eine kompakte Übersicht der Zustände und Validierungsregeln sowie acht annotierte Wireframes.

---

## 1. Geltungsbereich und Konventionen

Der authentifizierte Produktbereich ist erst nach erfolgreicher Anmeldung über den Auth-Dialog D-08 erreichbar. Er besteht aus einer persistenten App-Shell und vier Hauptbereichen, die über die Sidebar erreichbar sind. Innerhalb der Hauptbereiche werden Detail-Ansichten und Eingabe-Masken als Modale geöffnet.

### 1.1 Im Geltungsbereich

- Persistente App-Shell (USR-00) mit Sidebar und Header
- Journal-Bereich mit Overview, Entry Detail und Entry Form (USR-01 bis USR-03)
- Goals-Bereich mit Overview inklusive KI-Empfehlungen, Goal Detail und Goal Form (USR-04 bis USR-06)
- Calendar-Bereich mit Monatsansicht und Day-Detail (USR-07)
- Analytics-Dashboard mit KPI-Kacheln, Trends, Sentiment-Mix und Korrelationen (USR-08)

### 1.2 Außerhalb des Geltungsbereichs

- Admin-Dashboard, dokumentiert im Fachkonzept Admin-Bereich
- Öffentliche Landingpage und Auth-Dialog, dokumentiert im Fachkonzept Landingpage
- Chatbot (FloatingButton plus AIChat), nicht Bestandteil dieser Abgabe
- Authentifizierungsablauf und Token-Ausstellung über AWS Cognito
- Backend-Implementierungsdetails der Gemini-Aufrufe

### 1.3 Bezeichner-Konventionen

| Konvention | Beschreibung |
|---|---|
| USR-00 bis USR-08 | Eindeutige IDs für die neun Dialoge des authentifizierten Bereichs. Werden in Dialogliste, IA-Baum, Swimlane-Flows und Wireframe-Callouts wiederverwendet. |
| USR-XX.Y | Element-IDs innerhalb eines Dialogs. Werden in den nummerierten Callouts der Wireframes referenziert. |
| GATED | Schutzstufe. Alle Dialoge dieses Dokuments tragen diese Stufe. Backend prüft das JWT, Frontend leitet bei 401 zur Anmeldung um. |
| UC-1 bis UC-4 | Use-Case-Bezeichner. Werden in der Dialogliste und in den Swimlane-Flows referenziert. |

### 1.4 Marken- und Typografie-Konventionen

Identisch zu den anderen Fachkonzepten. Primärer Lila-Verlauf #9B30FF nach #6A0DAD, Schrift #171717, Helles Lila #F3E8FF, Erfolg #16A34A. Schriftfamilie Plus Jakarta Sans, Display-Gewichte 700 bis 800, Fließtext 400, Beschriftungen 500 bis 600.

### 1.5 Responsive-Breakpoints

Es gelten zwei Layout-Breakpoints. Desktop ab 1024 px, Mobile unter 768 px. Dazwischen klappt die Sidebar in eine Hamburger-Variante, Modale öffnen formatfüllend und mehrspaltige Karten-Layouts stapeln sich vertikal.

### 1.6 Zugriffsregel

Alle USR-Dialoge erfordern ein gültiges JWT mit Nutzer-Profil. Backend lehnt Anfragen ohne Token mit HTTP 401 ab, das Frontend leitet auf den Auth-Dialog D-08 zurück. Modale werden im Frontend nur gerendert, wenn der zugehörige Hauptbereich aktiv ist.

---

## 2. Use Cases

Vier kompakte Use Cases decken die wesentlichen Nutzeraufgaben im authentifizierten Bereich ab. Jeder Use Case nennt Akteur, Ziel, das Hauptszenario in nummerierten Schritten und einen Fehlerfall.

### UC-1 Tageseintrag erfassen

- Akteur: Registrierter Nutzer
- Ziel: Eintrag des aktuellen Tages mit Stimmungsdaten und KI-Reflexion ablegen

Hauptszenario:

1. Nutzer öffnet die Journal-Overview (USR-01) und klickt auf "Neuer Eintrag"
2. Entry Form (USR-03) öffnet als Modal, Datum vorausgefüllt
3. Nutzer trägt Titel und Inhalt ein und stellt die vier State-Slider Sentiment, Sleep, Stress und Social Engagement ein
4. KI-Toggle ist standardmäßig aktiv. Nach kurzer Tipp-Pause erscheint eine Reflexionsfrage unter dem Eingabefeld
5. Klick auf "Speichern" sendet `POST /journal/entries`
6. Backend führt vier Gemini-Calls parallel aus für Format, Aktivitäten, Sentiments und Ziel-Zuordnung
7. Modal schließt, neue Entry-Card erscheint in der Liste

Fehlerfall: Pflichtfeld leer, Inline-Validierung blockiert Submit. Netzwerkfehler, Toast mit Retry-Schaltfläche, Eingabe bleibt erhalten.

### UC-2 Vergangene Einträge nachlesen

- Akteur: Registrierter Nutzer
- Ziel: Eintrag aus früherem Zeitraum öffnen und seinen Inhalt prüfen

Hauptszenario:

1. Nutzer öffnet Journal-Overview (USR-01) oder Calendar (USR-07)
2. In der Liste filtert nach Datumsbereich, Sentiment, Sleep oder Stress, im Kalender klickt einen markierten Tag
3. Klick auf eine Entry-Card öffnet das Entry Detail Modal (USR-02)
4. Detail zeigt formatierten Inhalt, extrahierte Aktivitäten, Sentiment-Tags und verknüpfte Ziele
5. Nutzer schließt das Modal über das X oder Esc

Fehlerfall: Filter ergibt keine Treffer, Empty State mit Hinweistext "Keine Einträge im gewählten Zeitraum".

### UC-3 Persönliches Ziel anlegen

- Akteur: Registrierter Nutzer
- Ziel: Ein neues Ziel anlegen, optional mit KI-Unterstützung

Hauptszenario:

1. Nutzer öffnet Goals-Overview (USR-04)
2. Pfad A: KI-Empfehlungs-Panel zeigt drei Vorschläge auf Basis bisheriger Einträge. Klick auf "Übernehmen" öffnet Goal Form (USR-06) mit vorausgefüllter Beschreibung
3. Pfad B: Klick auf "Neues Ziel" öffnet leeres Goal Form
4. Nutzer trägt Beschreibung ein, klickt optional "KI verfeinern" für eine umformulierte Variante
5. Nutzer akzeptiert oder verwirft den Vorschlag und klickt "Speichern"

Fehlerfall: KI-Service nicht erreichbar, Inline-Hinweis "KI-Empfehlung aktuell nicht verfügbar". Manuelles Speichern bleibt möglich.

### UC-4 Wohlbefinden analysieren

- Akteur: Registrierter Nutzer
- Ziel: Trends und Korrelationen über einen Zeitraum erkennen

Hauptszenario:

1. Nutzer öffnet das Analytics-Dashboard (USR-08)
2. Period-Selector wählt einen von drei Zeiträumen, Standard 7 Tage
3. Dashboard rendert vier KPI-Kacheln, das Wellbeing-Trend-Chart, das Sentiment-Mix-Balkendiagramm und die KI-Korrelations-Karte
4. Nutzer schaltet Period auf 30 Tage oder 90 Tage und beobachtet, wie sich Trends verändern

Fehlerfall: Zu wenige Datenpunkte im gewählten Zeitraum, Empty State im Chart mit Hinweis "Mindestens 7 Einträge benötigt".

---

## 3. Dialogliste

### 3.1 Übersicht

| ID | Dialog | Typ | Auslöser | Use-Case-Bezug |
|---|---|---|---|---|
| USR-00 | App-Shell (Sidebar plus Header) | Persistent · GATED | Erfolgreiche Anmeldung über D-08 | alle |
| USR-01 | Journal Overview | Standard-Ansicht · GATED | Klick auf Tab "Journal" | UC-1, UC-2 |
| USR-02 | Entry Detail | Modal · GATED | Klick auf Entry-Card | UC-2 |
| USR-03 | Entry Form (Neu / Bearbeiten) | Modal · GATED | "Neuer Eintrag" oder Bearbeiten | UC-1 |
| USR-04 | Goals Overview mit KI-Empfehlungen | Standard-Ansicht · GATED | Klick auf Tab "Ziele" | UC-3 |
| USR-05 | Goal Detail | Modal · GATED | Klick auf Goal-Card | UC-3 |
| USR-06 | Goal Form (Neu / Bearbeiten) | Modal · GATED | "Neues Ziel", "Übernehmen" oder Bearbeiten | UC-3 |
| USR-07 | Calendar View mit Day-Detail | Standard-Ansicht · GATED | Klick auf Tab "Kalender" | UC-2 |
| USR-08 | Analytics Dashboard | Standard-Ansicht · GATED | Klick auf Tab "Analytics" | UC-4 |

### 3.2 Elemente in USR-00 App-Shell

| Element-ID | Name | Beschreibung |
|---|---|---|
| USR-00.1 | Brand-Lockup | Logo plus Wortmarke "Reflecta" oben links in der Sidebar |
| USR-00.2 | Sidebar-Tab Journal | Aktiver Zustand lila hinterlegt |
| USR-00.3 | Sidebar-Tab Ziele | wie oben |
| USR-00.4 | Sidebar-Tab Kalender | wie oben |
| USR-00.5 | Sidebar-Tab Analytics | wie oben |
| USR-00.6 | Header mit Begrüßung | Zeigt Nutzername und Tagesdatum |
| USR-00.7 | Logout-Schaltfläche | öffnet Bestätigungsdialog, anschließend Redirect auf Landingpage |

### 3.3 Elemente in USR-01 Journal Overview

| Element-ID | Name | Beschreibung |
|---|---|---|
| USR-01.1 | Sektionstitel | "Journal" plus Eintrag-Anzahl |
| USR-01.2 | Primärer CTA "Neuer Eintrag" | Gradient-Pill, öffnet USR-03 |
| USR-01.3 | Suchfeld | Volltextsuche über Titel und Inhalt |
| USR-01.4 | Datumsfilter Start und Ende | Zwei Date-Picker |
| USR-01.5 | Sentiment-Filter | Dropdown 1 bis 5 |
| USR-01.6 | Sleep-Filter | Dropdown 1 bis 5 |
| USR-01.7 | Stress-Filter | Dropdown 1 bis 5 |
| USR-01.8 | Filter zurücksetzen | Sekundär-Button, leert alle Filter |
| USR-01.9 | Entry-Liste | Vertikale Liste von Entry-Cards mit Datum, Titel-Auszug und Stimmungs-Indikator |
| USR-01.10 | Empty State | erscheint, wenn keine Einträge oder kein Treffer im Filter |

### 3.4 Elemente in USR-03 Entry Form Modal (Kernmaske)

| Element-ID | Name | Beschreibung |
|---|---|---|
| USR-03.1 | Modal-Header mit Titel und Schließen-X | Titel "Neuer Eintrag" oder "Eintrag bearbeiten" |
| USR-03.2 | Datumsfeld | Date-Picker, Pflichtfeld, vorausgefüllt mit heutigem Datum |
| USR-03.3 | Titelfeld | Textfeld, Pflichtfeld, max. 120 Zeichen |
| USR-03.4 | Inhaltsfeld | Textarea, Pflichtfeld, mehrzeilig, autoresize |
| USR-03.5 | KI-Toggle | Standardmäßig aktiv, schaltet die Reflexionsfrage ein und aus |
| USR-03.6 | Reflexionsfrage | Erscheint kursiv unter dem Inhaltsfeld nach Tipp-Pause von 1 Sekunde |
| USR-03.7 | Sentiment-Slider | 1 bis 5, Beschriftung sichtbar, Standard 3 |
| USR-03.8 | Sleep-Quality-Slider | wie oben |
| USR-03.9 | Stress-Level-Slider | wie oben |
| USR-03.10 | Social-Engagement-Slider | wie oben |
| USR-03.11 | Inline-Fehlerbereich | Erscheint bei leerem Pflichtfeld oder Servicefehler |
| USR-03.12 | Primärer Submit "Speichern" | Gradient-Pill, gesperrt während laufender KI-Analyse |
| USR-03.13 | Sekundär-Button "Abbrechen" | Schließt Modal ohne Speichern, mit Bestätigung bei ungespeicherten Änderungen |

### 3.5 Elemente in USR-04 Goals Overview

| Element-ID | Name | Beschreibung |
|---|---|---|
| USR-04.1 | Sektionstitel "Ziele" | mit aktueller Anzahl |
| USR-04.2 | Primärer CTA "Neues Ziel" | öffnet USR-06 leer |
| USR-04.3 | KI-Empfehlungs-Panel | Drei Vorschlags-Karten mit Beschreibung und "Übernehmen"-Button |
| USR-04.4 | Empfehlung neu generieren | Sekundär-Button, lädt drei neue Vorschläge |
| USR-04.5 | Goal-Liste | Karten mit Beschreibung und Fortschritts-Indikator |
| USR-04.6 | Empty State | erscheint, wenn keine Ziele angelegt sind |

### 3.6 Elemente in USR-06 Goal Form Modal

| Element-ID | Name | Beschreibung |
|---|---|---|
| USR-06.1 | Modal-Header | Titel "Neues Ziel" oder "Ziel bearbeiten" |
| USR-06.2 | Beschreibungsfeld | Textarea, Pflichtfeld, vorausgefüllt aus KI-Empfehlung sofern vorhanden |
| USR-06.3 | Schaltfläche "KI verfeinern" | Öffnet Vorschlags-Card unter dem Feld |
| USR-06.4 | KI-Vorschlags-Card | Zeigt umformulierten Vorschlag mit "Übernehmen" und "Verwerfen" |
| USR-06.5 | Inline-Fehlerbereich | Pflichtfeld-Fehler oder Service-Fehler |
| USR-06.6 | Primärer Submit "Speichern" | Gradient-Pill |
| USR-06.7 | Sekundär-Button "Abbrechen" | wie in USR-03 |

### 3.7 Elemente in USR-08 Analytics Dashboard

| Element-ID | Name | Beschreibung |
|---|---|---|
| USR-08.1 | Period-Selector | Drei Tabs für 7, 30 und 90 Tage |
| USR-08.2 | KPI-Kachel Avg Mood | Mittelwert des Sentiments im Zeitraum |
| USR-08.3 | KPI-Kachel Avg Sleep | Mittelwert der Sleep-Quality |
| USR-08.4 | KPI-Kachel Streak | Längste Sequenz aufeinanderfolgender Tage mit Eintrag |
| USR-08.5 | KPI-Kachel Entries | Anzahl Einträge im Zeitraum |
| USR-08.6 | Wellbeing-Trend-Chart | Linien-Chart Mood, Sleep, Stress mit synchronem Cursor |
| USR-08.7 | Sentiment-Mix | Balkendiagramm der Top-Emotionskategorien |
| USR-08.8 | Sleep-Ring | Radiale Anzeige des durchschnittlichen Schlafwertes |
| USR-08.9 | KI-Korrelations-Karte | Klartext-Insight zu zwei korrelierten Größen |

### 3.8 Kurzbeschreibung der einfachen Dialoge

USR-02 Entry Detail zeigt formatierten Inhalt, Datum, gesetzte Slider als Indikator-Reihe, Aktivitäts-Tags, Sentiment-Tags und verknüpfte Ziele. Aktionen Bearbeiten und Löschen.

USR-05 Goal Detail zeigt Beschreibung, Anlagedatum, Liste der zugeordneten Einträge und Fortschrittsanzeige. Aktionen Bearbeiten und Löschen.

USR-07 Calendar View zeigt eine Monats-Matrix. Tage mit Eintrag tragen einen lila Punkt. Klick auf einen Tag öffnet ein Day-Detail-Panel mit den Einträgen dieses Tages und ermöglicht das direkte Anlegen eines neuen Eintrags für diesen Tag über das gleiche Modal USR-03.

---

## 4. Informationsarchitektur

### 4.1 Komponentenbaum

Der authentifizierte Bereich ist als verschachtelter Komponentenbaum unter `AuthenticatedApp` organisiert. Die Sidebar steuert über `activeTab` den sichtbaren Hauptbereich. Detail- und Form-Modale werden bedarfsgesteuert in den jeweiligen Hauptbereich gemountet.

```
AuthenticatedApp [activeTab state, user]
├── Sidebar [journal | goals | calendar | analytics | (admin)]
├── Header
└── ActiveArea
    ├── JournalPage              ← activeTab === "journal"
    │   ├── EntryList
    │   │   └── EntryCard (n)
    │   ├── EntryDetailModal     ← state-gated
    │   └── EntryFormModal       ← state-gated
    │
    ├── GoalPage                 ← activeTab === "goals"
    │   ├── AIRecommendationPanel
    │   ├── GoalList
    │   │   └── GoalCard (n)
    │   ├── GoalDetailModal      ← state-gated
    │   └── GoalFormModal        ← state-gated
    │
    ├── CalendarPage             ← activeTab === "calendar"
    │   ├── JournalCalendar
    │   ├── DayDetailPanel       ← state-gated
    │   ├── EntryFormModal       ← state-gated, geteilt mit JournalPage
    │   └── GoalFormModal        ← state-gated, geteilt mit GoalPage
    │
    └── AnalyticsDashboard       ← activeTab === "analytics"
        ├── PeriodSelector
        ├── KPI-Kacheln (4)
        ├── WellbeingTrendChart
        ├── SentimentMixChart
        ├── SleepRing
        └── AICorrelationCard
```

### 4.2 Modal-Hierarchie

Alle Detail- und Form-Ansichten sind Modale und überlagern den jeweiligen Hauptbereich. Modale werden im React-State der Page-Komponente verwaltet, nicht in der Route. Esc und Klick außerhalb des Modals lösen einen Schließen-Versuch aus. Bei ungespeicherten Änderungen erscheint eine Bestätigung. Calendar und Journal teilen sich das Entry Form Modal, Calendar und Goals teilen sich das Goal Form Modal.

### 4.3 API-Endpunkte

| Methode | Endpunkt | Zweck | Schutz |
|---|---|---|---|
| GET | /journal/entries | Liste mit Filterparametern | GATED |
| POST | /journal/entries | Neuer Eintrag plus KI-Analyse | GATED |
| PUT | /journal/entries/{id} | Eintrag bearbeiten | GATED |
| DELETE | /journal/entries/{id} | Eintrag löschen | GATED |
| GET | /goals | Goals-Liste | GATED |
| POST | /goals | Neues Ziel | GATED |
| PUT | /goals/{id} | Ziel bearbeiten | GATED |
| DELETE | /goals/{id} | Ziel löschen | GATED |
| POST | /goals/enhance | KI-Verfeinerung eines Beschreibungstextes | GATED |
| GET | /goals/recommend | Drei KI-Empfehlungen auf Basis bisheriger Einträge | GATED |
| GET | /analytics/summary | KPI-Werte für gewählten Zeitraum | GATED |
| GET | /analytics/trends | Trend-Datenpunkte | GATED |
| GET | /analytics/correlations | Korrelations-Insights | GATED |
| GET | /analytics/stats | aggregierte Streak- und Entry-Counts | GATED |

### 4.4 Datenmodell (relevante DB-Tabellen)

| Tabelle | Relevante Felder | Genutzt für |
|---|---|---|
| journal_entries | id, user_id, title, content, formatted_content, sentiment_level, sleep_quality, stress_level, social_engagement, created_at | USR-01 bis USR-03, USR-07, USR-08 |
| journal_goal_association | journal_entry_id, goal_id | Verknüpfung in USR-02, USR-05 |
| goals | id, user_id, description, created_at | USR-04 bis USR-06 |
| ai_usage_logs | id, user_id, success, input_tokens, output_tokens, created_at | UC-Nebenflüsse, KI-Auswertung |

---

## 5. Swimlane-Ablaufdiagramme

Drei Lanes pro Diagramm: Nutzer-Browser, React-Frontend, FastAPI plus Gemini. Jeder Flow nutzt das aus den anderen Fachkonzepten bekannte Farbschema mit lila für Nutzeraktion, schwarz für Frontend, grün für Backend-Erfolg, orange für Backend-Verarbeitung und rot für Fehler.

### 5.1 Flow A: Tageseintrag erfassen mit KI-Analyse (Erfolg)

Realisiert UC-1.

```
NUTZER (BROWSER)             REACT (FRONTEND)                     FASTAPI + GEMINI
────────────────             ─────────────────                    ──────────────────
U1 Klick "Neuer Eintrag"  ──► S1 EntryFormModal mountet
                                  │ Defaults setzen (Datum heute)
U2 Eingabe Titel und Text    ──► S2 lokaler State
                                  │ Tipp-Pause 1 s
                                  │ wenn KI-Toggle aktiv
                                  └──► A1 POST /ai/reflection
                                                                    A1 Reflexionsfrage generieren
                                                            ◄──     A2 Antwort
                                  S3 Reflexionsfrage einblenden
U3 Slider justieren          ──► S4 lokaler State
U4 Klick "Speichern"         ──► S5 POST /journal/entries
                                                                    A3 Validierung Pflichtfelder
                                                                    A4 vier Gemini-Calls parallel
                                                                       (Format, Aktivitäten,
                                                                        Sentiments, Ziele)
                                                                    A5 Persistenz in journal_entries
                                                                       und journal_goal_association
                                                            ◄──     A6 HTTP 201 plus angereichertes
                                                                       Entry-Objekt
                                  S6 setEntries(prev plus new)
                                  S7 Modal schließen
                          ◄──     S8 Toast "Eintrag gespeichert"
U5 neue Entry-Card sichtbar
```

### 5.2 Flow B: Ziel mit KI-Empfehlung anlegen (Erfolg)

Realisiert UC-3 Pfad A.

```
NUTZER (BROWSER)             REACT (FRONTEND)                     FASTAPI + GEMINI
────────────────             ─────────────────                    ──────────────────
U1 Klick Tab "Ziele"         ──► S1 GoalPage mountet
                                  └──► A1 GET /goals
                                                            ◄──     A2 Liste der Goals
                                  └──► A3 GET /goals/recommend
                                                                    A4 Gemini analysiert bisherige
                                                                       Einträge und erzeugt drei
                                                                       Vorschläge
                                                            ◄──     A5 JSON mit drei Vorschlägen
                                  S2 KI-Empfehlungs-Panel füllen
U2 Klick "Übernehmen" auf    ──► S3 GoalFormModal öffnen mit
   Vorschlag 2                       vorausgefüllter Beschreibung
U3 Klick "Speichern"         ──► S4 POST /goals
                                                                    A6 Validierung und Persistenz
                                                            ◄──     A7 HTTP 201 plus Goal-Objekt
                                  S5 setGoals(prev plus new)
                                  S6 Modal schließen
                          ◄──     S7 Toast "Ziel angelegt"
U4 neues Ziel in Liste sichtbar
```

### 5.3 Flow C: Validierungsfehler im Entry Form (Fehler)

Realisiert den Fehlerfall von UC-1. Zeigt sowohl die clientseitige Inline-Validierung als auch den serverseitigen Fehlerfall, falls die Validierung clientseitig umgangen wird.

```
NUTZER (BROWSER)             REACT (FRONTEND)                     FASTAPI + GEMINI
────────────────             ─────────────────                    ──────────────────
U1 Klick "Speichern"         ──► S1 lokale Validierung
   ohne Titel                       Titel leer → Submit-Aufruf
                                  abgebrochen, Fehler ermittelt
                          ◄──     S2 Fehlerbereich rot eingeblendet,
                                  Eingabefeld fokussiert
U2 Fehler sichtbar, Nutzer
   korrigiert oder bricht ab

(Falls Client-Validierung umgangen wird, etwa per direktem fetch)
U3 Direkter Request          ──► S3 fetch POST /journal/entries
                                                                    A1 Validierung Pflichtfelder
                                                                       Titel leer → 422
                                                            ◄──     A2 HTTP 422 plus Detail-JSON
                                  S4 catch-Block
                          ◄──     S5 Toast "Eintrag konnte nicht
                                  gespeichert werden"
U4 Toast sichtbar, Eingabe
   bleibt im Modal erhalten
```

---

## 6. ISO 9241-110 Bewertung

Dieser Abschnitt bewertet die User-Masken gegen die sieben Dialogprinzipien der DIN EN ISO 9241-110. Pro Prinzip wird die konkrete UI-Maßnahme in Reflecta benannt und der oder die betroffenen Dialoge zugeordnet.

| Prinzip | UI-Maßnahme in Reflecta | Betroffene Dialoge |
|---|---|---|
| Aufgabenangemessenheit | Entry Form bündelt alle Eingaben einer Tagesreflexion auf einer Modal-Seite. Pflicht sind nur Datum, Titel und Inhalt. Slider haben sinnvolle Defaults. KI-Reflexionsfrage liefert Aufgabenstütze, ohne sie zu erzwingen. | USR-03, USR-06 |
| Selbstbeschreibungsfähigkeit | State-Slider tragen Beschriftung und numerische Skala 1 bis 5. Status-Pills zeigen "AI ON" sichtbar an. Empty States nennen nicht nur den Zustand, sondern auch den nächsten Schritt. | USR-01, USR-03, USR-04, USR-08 |
| Erwartungskonformität | Sidebar-Reihenfolge Journal, Ziele, Kalender, Analytics ist konsistent über alle Bereiche. Primär-CTAs immer als Gradient-Pill, Sekundär als umrandete Pill. Modal-Schließen über X oben rechts und Esc-Taste. | USR-00 bis USR-08 |
| Lernförderlichkeit | KI-Toggle wird beim ersten Eintrag durch eine Tooltip-Bubble erklärt. Beispieltexte in den KI-Empfehlungen zeigen, wie ein gut formuliertes Ziel aussieht. Filterleiste behält Werte zwischen Sitzungen, sodass Wiederholungsmuster erkennbar werden. | USR-01, USR-03, USR-04 |
| Steuerbarkeit | Modale jederzeit über Esc oder X schließbar, ungespeicherte Änderungen lösen Bestätigungs-Dialog aus. KI-Reflexion abschaltbar pro Eintrag. KI-Verfeinerung kann verworfen werden, ohne den manuellen Text zu verlieren. Period-Selector im Analytics-Dashboard erlaubt freie Zeitraum-Wahl. | USR-03, USR-06, USR-08 |
| Fehlertoleranz | Pflichtfeld-Validierung inline und vor dem Submit. Servicefehler werden als Toast mit Retry-Schaltfläche angezeigt, Eingabe bleibt erhalten. KI-Service-Ausfall bricht den Flow nicht ab, manuelles Speichern bleibt möglich. Optimistic UI rollt bei Server-Fehler zurück. | USR-03, USR-06 |
| Individualisierbarkeit | Filter-Auswahl pro Sitzung gespeichert. Period-Selector behält den zuletzt gewählten Zeitraum. KI-Toggle pro Eintrag setzbar. Theme folgt System-Preference, sofern vorhanden. | USR-01, USR-08 |

---

## 7. Zustände und Validierung

### 7.1 Empty, Loading, Error pro Dialog

| Dialog | Empty State | Loading State | Error State |
|---|---|---|---|
| USR-01 Journal Overview | Illustration plus Hinweistext "Noch kein Eintrag. Beginne mit deinem ersten." plus Primär-CTA | Skeleton-Karten als Listen-Platzhalter | Toast plus Retry-Button, Liste bleibt leer |
| USR-02 Entry Detail | nicht anwendbar (Modal nur bei vorhandenem Eintrag) | Skeleton im Inhaltsbereich | Toast und automatisches Schließen |
| USR-03 Entry Form | nicht anwendbar | Submit-Button zeigt Spinner und ist gesperrt während paralleler KI-Calls | Inline-Fehlerbereich plus Toast |
| USR-04 Goals Overview | Illustration plus Hinweis "Keine Ziele angelegt" plus CTA und KI-Empfehlungs-Panel | Skeleton für Empfehlungen, Spinner für Liste | Empfehlungs-Panel zeigt Inline-Fallback "Empfehlungen aktuell nicht verfügbar" |
| USR-05 Goal Detail | nicht anwendbar | Skeleton | Toast und Schließen |
| USR-06 Goal Form | nicht anwendbar | Submit zeigt Spinner, KI-Verfeinerung zeigt eigenen Spinner | Inline-Fehlerbereich, KI-Fallback wie in USR-04 |
| USR-07 Calendar View | Hinweis "Keine Einträge in diesem Monat" über der Matrix | Skeleton-Matrix mit grauen Tagen | Toast plus Retry |
| USR-08 Analytics Dashboard | Globaler Empty State "Mindestens 7 Einträge benötigt" mit Verweis auf USR-03 | Skeleton-Kacheln, Charts mit grauer Platzhalter-Linie | Toast plus Retry pro Sektion |

### 7.2 Validierungsregeln

| Form | Feld | Pflicht | Regel | Trigger | Fehlermeldung |
|---|---|---|---|---|---|
| USR-03 Entry Form | Datum | ja | gültiges Datum, nicht in Zukunft | Blur und Submit | "Bitte ein gültiges Datum wählen" |
| USR-03 | Titel | ja | 1 bis 120 Zeichen | Blur und Submit | "Titel darf nicht leer sein" |
| USR-03 | Inhalt | ja | mindestens 1 Zeichen | Submit | "Inhalt darf nicht leer sein" |
| USR-03 | Sentiment | nein | 1 bis 5 | n/a | n/a |
| USR-03 | Sleep, Stress, Social | nein | 1 bis 5 | n/a | n/a |
| USR-06 Goal Form | Beschreibung | ja | 1 bis 500 Zeichen | Blur und Submit | "Beschreibung darf nicht leer sein" |

Inline-Fehler werden direkt unter dem betroffenen Feld in Rot eingeblendet, der Submit-Button bleibt aktiv, da er den Fehler erneut anzeigt. Toasts werden für Service- und Netzwerkfehler genutzt und enthalten einen Retry-Button.

---

## 8. Annotierte Wireframes

Acht Wireframes zeigen die User-Masken im Desktop-Layout. Jedes Wireframe trägt einen Header mit Dialog-ID und Schutzstufe sowie nummerierte Callouts, die Element-IDs auflösen und Usability-Aussagen pointieren. Die Bilddateien werden separat in `Abgabe_26_05/Frontend-Userforms/Assets/` als PNG abgelegt und in der HTML-Quelle referenziert.

### 8.1 USR-01 Journal Overview

Header: Dialog USR-01 · Journal Overview · GATED

Callouts:

1. Sidebar-Tab "Journal" (USR-00.2) lila hinterlegt, ausgewählter Bereich
2. Sektionstitel mit aktueller Eintrag-Anzahl (USR-01.1)
3. Primärer CTA "Neuer Eintrag" (USR-01.2), öffnet USR-03
4. Such- und Filterleiste (USR-01.3 bis USR-01.8) erfüllt Aufgabenangemessenheit, Filterzustand bleibt erhalten
5. Entry-Liste mit Karten (USR-01.9), Stimmungs-Indikator als Mini-Slider-Grafik
6. Empty State (USR-01.10) erscheint, wenn keine Treffer

### 8.2 USR-03 Entry Form Modal (Kernmaske)

Header: Dialog USR-03 · Entry Form · GATED · Modal

Callouts:

1. Modal-Header mit Schließen-X (USR-03.1), Esc schließt ebenfalls
2. Datum vorausgefüllt (USR-03.2), reduziert Tipparbeit, Aufgabenangemessenheit
3. Titel (USR-03.3) und Inhalt (USR-03.4) als Pflichtfelder mit Inline-Validierung
4. KI-Toggle "AI ON" (USR-03.5), aktiviert Reflexionsfrage, jederzeit abschaltbar (Steuerbarkeit)
5. Reflexionsfrage (USR-03.6) erscheint kursiv unter dem Inhaltsfeld nach Tipp-Pause
6. State-Slider 1 bis 5 (USR-03.7 bis USR-03.10) mit klar lesbarer Beschriftung
7. Inline-Fehlerbereich (USR-03.11), erscheint nur bei Bedarf
8. Primärer Submit "Speichern" (USR-03.12), zeigt Spinner während paralleler KI-Calls
9. Sekundär-Button "Abbrechen" (USR-03.13), löst Bestätigungs-Dialog bei ungespeicherten Änderungen aus

### 8.3 USR-02 Entry Detail Modal

Header: Dialog USR-02 · Entry Detail · GATED · Modal

Callouts:

1. Modal-Header mit Datum, Titel und Schließen-X
2. Formatierter Inhalt im Lesetext-Layout
3. State-Indikator-Reihe als Read-Only-Slider in Mini-Größe
4. Aktivitäts-Tags als Chips, KI-extrahiert
5. Sentiment-Tags als Chips, KI-extrahiert
6. Verknüpfte Ziele als kleine Goal-Cards
7. Sekundär-Aktionen "Bearbeiten" (öffnet USR-03) und "Löschen" (Bestätigungs-Dialog)

### 8.4 USR-04 Goals Overview mit KI-Empfehlungen

Header: Dialog USR-04 · Goals Overview · GATED

Callouts:

1. Sidebar-Tab "Ziele" (USR-00.3) aktiv
2. Sektionstitel und Anzahl (USR-04.1)
3. Primärer CTA "Neues Ziel" (USR-04.2)
4. KI-Empfehlungs-Panel (USR-04.3) mit drei Vorschlags-Karten
5. Schaltfläche "Empfehlung neu generieren" (USR-04.4) als Sekundär-Button
6. Goal-Liste (USR-04.5) mit Fortschritts-Indikator pro Karte
7. Empty State (USR-04.6) wenn keine Ziele angelegt sind

### 8.5 USR-06 Goal Form Modal mit KI-Verfeinerung

Header: Dialog USR-06 · Goal Form · GATED · Modal

Callouts:

1. Modal-Header (USR-06.1)
2. Beschreibungsfeld (USR-06.2), gegebenenfalls mit Vorbefüllung aus KI-Empfehlung
3. Schaltfläche "KI verfeinern" (USR-06.3), löst KI-Aufruf aus
4. KI-Vorschlags-Card (USR-06.4) zeigt umformulierten Vorschlag mit "Übernehmen" und "Verwerfen", erfüllt Steuerbarkeit
5. Inline-Fehlerbereich (USR-06.5)
6. Primärer Submit (USR-06.6) und Sekundär-Button (USR-06.7)

### 8.6 USR-05 Goal Detail Modal

Header: Dialog USR-05 · Goal Detail · GATED · Modal

Callouts:

1. Modal-Header mit Beschreibung als Titel
2. Anlagedatum
3. Liste der zugeordneten Einträge, Klick navigiert in USR-02
4. Fortschrittsanzeige (Anzahl Einträge mit dieser Goal-Verknüpfung)
5. Aktionen "Bearbeiten" und "Löschen"

### 8.7 USR-07 Calendar View mit Day-Detail

Header: Dialog USR-07 · Calendar View · GATED

Callouts:

1. Sidebar-Tab "Kalender" (USR-00.4) aktiv
2. Monats-Navigation oben mit Vor- und Zurück-Pfeil sowie aktuellem Monat
3. Monats-Matrix, Tage mit Eintrag tragen einen lila Punkt
4. Day-Detail-Panel rechts (oder unten in Mobile), zeigt Einträge des markierten Tages
5. CTA "Eintrag für diesen Tag anlegen" öffnet USR-03 mit vorausgefülltem Datum

### 8.8 USR-08 Analytics Dashboard

Header: Dialog USR-08 · Analytics Dashboard · GATED

Callouts:

1. Sidebar-Tab "Analytics" (USR-00.5) aktiv
2. Period-Selector (USR-08.1) mit 7, 30, 90 Tagen, Selbstbeschreibungsfähigkeit über Tab-Beschriftung
3. Vier KPI-Kacheln (USR-08.2 bis USR-08.5)
4. Wellbeing-Trend-Chart (USR-08.6) mit synchronem Hover-Cursor
5. Sentiment-Mix-Balkendiagramm (USR-08.7)
6. Sleep-Ring (USR-08.8) als radiale Anzeige
7. KI-Korrelations-Karte (USR-08.9) mit Klartext-Insight

---

## Anhang A: Mapping zu Komponentenpfaden im Repo

Aus Konsistenz mit den anderen Fachkonzepten werden im Hauptdokument keine Code-Pfade genannt. Für die spätere HTML-Umsetzung dient diese Tabelle als interner Bezug.

| Dialog | React-Komponente |
|---|---|
| USR-00 | App-Shell aus `App.js` mit `Sidebar` und `Header` |
| USR-01 | `JournalPage` plus `EntryList` und `EntryCard` |
| USR-02 | `EntryDetail` |
| USR-03 | `EntryForm` |
| USR-04 | `GoalPage` plus `GoalList` und `GoalCard` |
| USR-05 | `GoalDetail` |
| USR-06 | `GoalForm` |
| USR-07 | `CalendarPage` plus `JournalCalendar` |
| USR-08 | `AnalyticsPage` plus `AnalyticsDashboard` |

## Anhang B: Offene Punkte vor HTML-Umsetzung

- Wireframe-PNGs müssen erstellt werden, idealerweise aus laufender App per Screenshot plus Annotation, alternativ als Figma-Mockup
- Mitarbeiter-Matrikelnummer muss im Cover ergänzt werden
- Falls die Abgabe einen separaten Wireframe-only PDF wie in den anderen Bereichen verlangt, wird parallel eine `userforms_fachkonzept_wireframe.html` benötigt
- KI-Reflexion in USR-03 verwendet im Code `AIButton`, der Endpunkt `/ai/reflection` ist im Spec angenommen, sollte vor HTML-Umsetzung gegen die reale `api.js` geprüft werden
