# IPD App

Eine moderne Web-Anwendung basierend auf SvelteKit mit TypeScript, Skeleton UI und funktionaler Programmierung mit effect-ts.

## Tech Stack

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| **SvelteKit** | ^2.50.2 | Framework |
| **Svelte** | ^5.49.2 | UI-Komponenten |
| **TypeScript** | ^5.9.3 | Typisierung |
| **Vite** | ^7.3.1 | Build-Tool |
| **Skeleton** | ^4.12.0 | UI-Design System |
| **TailwindCSS** | ^4.1.18 | Styling |
| **effect-ts** | ^3.19.17 | Funktionale Programmierung |
| **D3.js** | ^7.9.0 | Datenvisualisierung |
| **ChromaJS / Culori** | - | Farbverarbeitung |

## Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build erstellen
npm run build

# Build lokal previewen
npm run preview

## Entwicklung
TypeScript Check

# Einmaliger Check
npm run check

# Im Watch-Modus
npm run check:watch

























# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv create --template minimal --types ts --add tailwindcss="plugins:none" --install npm ipd-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
