---
geometry: margin=2.2cm
fontsize: 11pt
mainfont: "Helvetica Neue"
monofont: "Courier"
colorlinks: true
urlcolor: "violet"
linkcolor: "violet"
header-includes: |
  \usepackage{graphicx}
  \usepackage{float}
  \usepackage{booktabs}
---

# Fachkonzept -- Admin-Bereich Reflecta

**Projekt:** Reflecta \hspace{1cm} **Bereich:** Frontend-Adminforms \hspace{1cm} **Datum:** Mai 2026

**Zielgruppe:** Admins (`is_admin = true`)

---

## 1. Dialogliste

| Dialog-ID | Name | Typ | Auslöser | Beschreibung |
|:----------|:-----|:----|:---------|:-------------|
| ADM-00 | Stats Overview | Standard-Ansicht | Navigation -> Admin | Nutzer, Einträge, AI-Calls, Tokens |

Der Admin-Bereich besteht aktuell aus einer einzigen Ansicht (**AdminDashboard**).
Die Seite lädt beim ersten Rendern automatisch via `useEffect` und zeigt die Stats
aus `GET /admin/stats`. Es gibt keine weiteren Tabs oder Dialoge.

---

## 2. Informationsarchitektur

### Komponentenbaum

```
App.js
+-- AuthenticatedApp   [activeTab state]
    +-- Sidebar        [journal|goals|calendar|analytics|admin]
    +-- Header
    +-- AdminDashboard   (nur wenn activeTab === "admin")
            Laedt via useEffect -> getAdminStats()
            -> GET /admin/stats
        +-- StatCard: Total Users
        +-- StatCard: Active Users (7d)
        +-- StatCard: Total Entries
        +-- StatCard: AI Calls Today
        +-- AI Usage Card
            +-- Total Calls / Success Rate / Total Tokens
```

### API-Endpunkt

| Methode | Endpunkt | Antwort-Felder | Schutz |
|:--------|:---------|:---------------|:-------|
| GET | `/admin/stats` | total_users, active_users_7d, total_entries, total_ai_calls, ai_success_rate, ai_calls_today, ai_tokens_total | is_admin |

Der Endpunkt verwendet die `get_current_admin`-Dependency. FastAPI prüft das
JWT-Token (AWS Cognito) und stellt sicher, dass `user.is_admin == True` -- andernfalls HTTP 403.

### Datenmodell

| Tabelle | Relevante Felder | Genutzt für |
|:--------|:----------------|:------------|
| users | id, is_admin, created_at | total_users |
| journal_entries | id, user_id, created_at | total_entries, active_users_7d |
| ai_usage_logs | id, success, input_tokens, output_tokens, created_at | ai_calls, ai_success_rate, ai_tokens_total |

---

## 3. Swimlane-Ablaufdiagramm

### Flow A -- Stats-Übersicht laden (ADM-00)

Admin navigiert zum Admin-Bereich. Die Stats-Seite lädt beim ersten Rendern
automatisch. Hinweg (lila) von links nach rechts bis zur DB, Rückweg (grün) zurück.

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{swimlane_flow_a.svg.png}
\end{figure}

---

## 4. Wireframes

### ADM-00 -- Stats Overview

\begin{figure}[H]
\centering
\includegraphics[width=\textwidth]{wireframe_adm00.png}
\end{figure}
