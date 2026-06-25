# Arbeitsplanung – Wichtelomat

> Modul 210 · LB-Projektarbeit · WISS  
> Erstellt: 22.06.2026  
> Abgabe: 27. Juni 2026, 14:30

---

## Zeitplan Übersicht

| Phase | Tasks | Geschätzte Zeit |
|---|---|---|
| 1 – Planung & Setup | Doku, Git, Supabase-Projekt | 3h |
| 2 – Datenbank | Migrations, RLS, RPC | 4h |
| 3 – Auth & Frontend-Setup | Vite, Routing, AuthContext | 3h |
| 4 – Core Features | CRUD-Services, Hauptseiten | 8h |
| 5 – Auslosung & E-Mail | RPC testen, Edge Function | 3h |
| 6 – Einladungs-Flow | Invitation-Seite, Gast-Beitritt | 2h |
| 7 – CI/CD & Docker | GitHub Actions, Dockerfile | 2h |
| 8 – Abschluss | Review, README, Abgabe | 2h |
| **Total** | | **~27h** |

---

## Detaillierte Arbeitspakete

### Phase 1 – Planung & Setup

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| Initial Commit, Git-Branches anlegen | 0.5h | 0.1h | 22.06.2026 | ✅ |
| .gitignore erstellen | 0.25h | 0.1h | 22.06.2026 | ✅ |
| README.md (Projekt Pitch) erstellen | 0.5h | 0.5h | 22.06.2026 | ✅ |
| User Stories dokumentieren | 1h | 1h | 22.06.2026 | ✅ |
| Datenmodell dokumentieren | 0.5h | 0.5h | 22.06.2026 | ✅ |
| Arbeitsplanung erstellen | 0.25h | 0.25h | 22.06.2026 | ✅ |
| Supabase Projekt erstellen + CLI einrichten | 0.5h | 0.5h | 22.06.2026 | ✅ |

---

### Phase 2 – Datenbank

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| Migration-Datei anlegen | 0.25h | 0.1h | 22.06.2026 | ✅ |
| Enums erstellen (action_status, role_in_action, invitation_status) | 0.25h | 0.25h | 22.06.2026 | ✅ |
| Tabellen erstellen (wichtel_aktionen, memberships) | 0.5h | 0.5h | 22.06.2026 | ✅ |
| Tabellen erstellen (exclusions, assignments, wishlists) | 0.5h | 0.5h | 22.06.2026 | ✅ |
| Tabellen erstellen (invitations, member_access_tokens) | 0.25h | 0.25h | 22.06.2026 | ✅ |
| RLS aktivieren für alle Tabellen | 0.25h | 0.1h | 22.06.2026 | ✅ |
| RLS Policies – wichtel_aktionen | 0.5h | 0.25h | 22.06.2026 | ✅ |
| RLS Policies – memberships | 0.5h | 0.25h | 22.06.2026 | ✅ |
| RLS Policies – assignments, wishlists, invitations | 0.5h | 0.25h | 22.06.2026 | ✅ |
| RPC Funktion draw_assignments implementieren | 1h | 1h | 22.06.2026 | ✅ |
| Migration auf Supabase anwenden (supabase db push) | 0.25h | 0.5h | 23.06.2026 | ✅ |

---

### Phase 3 – Auth & Frontend-Setup

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| Vite + React Projekt erstellen, Dependencies installieren | 0.5h | 0.25h | 23.06.2026 | ✅ |
| Supabase Client initialisieren (supabaseClient.js) | 0.25h | 0.25h | 23.06.2026 | ✅ |
| i18n konfigurieren + Übersetzungsdateien (DE/EN) | 0.5h | 0.5h | 23.06.2026 | ✅ |
| Design-Tokens erstellen (tokens.css, global.css) | 0.5h | 0.5h | 23.06.2026 | ✅ |
| Ordnerstruktur anlegen | 0.25h | 0.1h | 23.06.2026 | ✅ |
| AuthContext.jsx implementieren | 0.5h | 0.5h | 23.06.2026 | ✅ |
| App.jsx mit Routing und ProtectedRoute | 0.5h | 0.5h | 23.06.2026 | ✅ |

---

### Phase 4 – Core Features

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| authService.js (register, login, logout, reset, profil) | 0.75h | 0.75h | 23.06.2026 | ✅ |
| LoginPage.jsx | 0.5h | 0.5h | 23.06.2026 | ✅ |
| RegisterPage.jsx | 0.5h | 0.5h | 25.06.2026 | ✅ |
| ForgotPasswordPage.jsx + ResetPasswordPage.jsx | 0.5h | 0.5h | 25.06.2026 | ✅ |
| actionsService.js (CRUD) | 0.75h | 1.5h | 25.06.2026 | ✅ |
| ActionsListPage.jsx | 0.75h | 0.75h | 25.06.2026 | ✅ |
| CreateActionPage.jsx | 0.5h | 0.5h | 25.06.2026 | ✅ |
| memberService.js (getMembers, removeMember) | 0.5h | 0.5h | 25.06.2026 | ✅ |
| wishlistService.js (getWishlist, saveWishlist) | 0.5h | 0.5h | 25.06.2026 | ✅ |
| ActionDetailPage.jsx – Tab Mitglieder | 1h | 1h | 25.06.2026 | ✅ |
| ActionDetailPage.jsx – Tab Ausschlüsse | 1h | 1h | 25.06.2026 | ✅ |
| ActionDetailPage.jsx – Tab Vorgaben | 0.5h | 0.5h | 25.06.2026 | ✅ |
| ActionDetailPage.jsx – Tab Wunschzettel | 0.5h | 0.5h | 25.06.2026 | ✅ |
| ActionDetailPage.jsx – Tab Zuweisung | 0.5h | 0.5h | 25.06.2026 | ✅ |
| Modal-Komponente für Bestätigungsdialoge | 0.5h | 0.5h | 25.06.2026 | ✅ |

---

### Phase 5 – Auslosung & E-Mail

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| drawService.js (RPC-Aufruf) | 0.25h | 0.25h | 25.06.2026 | ✅ |
| Auslosung in ActionDetailPage integrieren + testen | 0.5h | 0.5h | 25.06.2026 | ✅ |
| Edge Function send-assignment-email erstellen | 1h | 1h | 25.06.2026 | ✅ |
| Resend Account einrichten + API Key | 0.25h | 0.25h | 25.06.2026 | ✅ |
| Edge Function deployen + testen | 0.5h | 0.5h | 25.06.2026 | ✅ |
| assignmentService.js (getMyAssignment) | 0.5h | 0.5h | 25.06.2026 | ✅ |

---

### Phase 6 – Einladungs-Flow

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| invitationService.js (Einladung erstellen, Token prüfen) | 0.5h | 0.5h | 25.06.2026 | ✅ |
| InvitationPage.jsx (Gast / Login / Register Optionen) | 1h | 1h | 25.06.2026 | ✅ |
| Einladungs-Flow testen (E-Mail + Link) | 0.5h | 0.5h | 25.06.2026 | ✅ |

---

### Phase 7 – CI/CD & Docker

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| frontend-ci.yml erstellen | 0.25h | 0.25h | 25.06.2026 | ✅ |
| supabase-deploy.yml erstellen | 0.25h | 0.25h | 25.06.2026 | ✅ |
| GitHub Secrets konfigurieren | 0.25h | 0.25h | 25.06.2026 | ✅ |
| CI Pipelines testen (grüner Build) | 0.25h | 0.25h | 25.06.2026 | ✅ |
| Dockerfile (Frontend, mehrstufig) erstellen | 0.5h | 0.5h | 25.06.2026 | ✅ |
| nginx.conf erstellen | 0.25h | 0.25h | 25.06.2026 | ✅ |
| docker-compose.yml erstellen | 0.25h | 0.25h | 25.06.2026 | ✅ |
| Docker-Build lokal testen | 0.25h | 0.25h | 25.06.2026 | ✅ |

---

### Phase 8 – Abschluss

| Task | Geschätzt | Effektiv | Datum | Status |
|---|---|---|---|---|
| README.md vervollständigen (Architektur, Deployment, Review) | 0.5h | 0.5h | 25.06.2026 | ✅ |
| Kritischen Review schreiben | 0.5h | 0.5h | 25.06.2026 | ✅ |
| Vollständigen End-to-End-Test durchführen | 0.5h | 0.5h | 25.06.2026 | ✅ |
| .env-Datei für Lehrer vorbereiten | 0.25h | 0.25h | 25.06.2026 | ✅ |
| Finaler Commit + Tag, Abgabe | 0.25h | 0.25h | 25.06.2026 | ✅ |

---

## Stundenprotokoll

*Wird laufend ausgefüllt während der Arbeit.*

| Datum | Beschreibung | Geschätzt | Effektiv | Differenz |
|---|---|---|---|---|
| 22.06.2026 | Initial Commit, Git-Branches | 0.5h | 0.5h | ✅ |
| 22.06.2026 | .gitignore | 0.25h | 0.25 | ✅ |
| 22.06.2026 | README.md | 0.5h | 0.5h | ✅ |
| 22.06.2026 | User Stories | 1h | 1h | ✅ |
| 22.06.2026 | Datenmodell | 0.5h | 0.5h | ✅ |
| 22.06.2026 | Arbeitsplanung | 0.25h | 0.25h | ✅ |
| | | | | | |
| | | **Total** | **~27h** | | |
