# Fundament Command Center

PWA-Dashboard über alle Fundament-IT-Projekte (Kunden + eigene) für Eray Yesil und Hassan Süslü. Installierbar auf dem Handy übers Homescreen, kein App-Store nötig.

## Stack

- Vite + React + TypeScript
- Tailwind CSS 4
- vite-plugin-pwa (installierbar, offlinefähig)
- Supabase (Postgres + Auth + Echtzeit-Sync)

## Setup

```bash
npm install
cp .env.example .env.local   # Supabase-URL + Anon-Key eintragen
npm run dev
```

Ohne `.env.local` läuft die App im **Demo-Modus** mit Mock-Daten (kein Login nötig).

## Datenbank

Schema liegt in `supabase/migrations/0001_init.sql` (Tabellen `projects`, `milestones`, RLS für 2 authentifizierte Nutzer).

## Meilensteine

1. Datenmodell + Auth (2 Nutzer), PWA-Grundgerüst installierbar
2. Echtzeit-Projektübersicht
3. Sprachsteuerung (Web Speech API)
4. Meeting-Mitschnitt inkl. Consent-Flow + Protokollablage
5. Automatische Anbindung an Claude-Code-Session-Status (mit Opt-out für private Sessions)
