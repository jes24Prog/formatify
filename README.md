# Formatify

A browser-based tool for working with structured data files. Format, validate, sort, convert and compare **JSON**, **XML** and **YAML** — no uploads, everything stays in your browser.

## Features

### Dual editors

Two code panes side by side. On small screens they stack automatically so you can still use the app from a phone. Each pane has its own language selector (JSON / XML / YAML / plain text) and its own toolbar.

### Syntax highlighting

The editors are powered by [Monaco](https://microsoft.github.io/monaco-editor/) — the same engine behind VS Code — with JSON, XML, YAML and plain-text highlighting, find & replace, and a minimap.

### Beautify

Pretty-prints the current pane with one click:

- **JSON** — indented with Prettier
- **XML** — indented with `xml-formatter`
- **YAML** — parsed and re-serialized with the `yaml` library

Invalid input never overwrites your editor; you get a toast with the error instead.

### Validate

Checks the current pane for syntax errors and reports the first problem:

- **JSON** — strict `JSON.parse`
- **XML** — validated with `fast-xml-validator`
- **YAML** — validated with the `yaml` parser

A status indicator in each pane footer shows **Empty**, **Valid** or **Invalid** as you type.

### Sort

Rearranges the current pane in place:

- **Object keys** — JSON and YAML object properties are sorted alphabetically, recursively
- **Array items** — numbers sort numerically, strings alphabetically, grouped by type
- **XML elements** — child elements are sorted alphabetically at every level, keeping attributes, text, comments and duplicate tags intact

### Convert

Turns the left pane into the right pane's format. All six conversions are supported: JSON ↔ XML, JSON ↔ YAML, XML ↔ YAML.

### Compare

Switches to a Monaco diff view of both panes. Toggle between **side-by-side** and **inline** layouts. The status bar tells you at a glance whether the two documents differ.

### File I/O

Each pane can:

- **Open** a local file, or **drag & drop** one onto the editor (the language is detected from the file extension)
- **Paste** from the clipboard
- **Copy** the contents
- **Clear** the editor
- **Download** the contents as a file

### Dark mode

Follows your system setting by default, with a toggle in the header. Monaco switches theme to match.

### Session restore

Your last session (both panes, both languages) is saved to `localStorage` and restored on reload.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Beautify left pane | `Ctrl/⌘ + Alt + F` |
| Beautify right pane | `Ctrl/⌘ + Alt + G` |
| Swap panes | `Ctrl/⌘ + Alt + X` |
| Convert left → right | `Ctrl/⌘ + Alt + V` |
| Compare / back to editors | `Ctrl/⌘ + Alt + D` |

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router) + [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react`
- [Prettier](https://prettier.io/) · [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) · [fast-xml-validator](https://www.npmjs.com/package/fast-xml-validator) · [xml-formatter](https://www.npmjs.com/package/xml-formatter) · [yaml](https://eemeli.org/yaml/)

## Getting started

Requirements: Node.js 20+ and npm.

```bash
# install dependencies
npm install

# start the dev server (http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript type checker |

## Project structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout, fonts, theme provider, metadata
│   ├── page.tsx           # Home page
│   ├── globals.css        # Tailwind + shadcn theme tokens
│   ├── robots.ts          # robots.txt
│   └── manifest.ts        # Web app manifest
├── components/
│   ├── format-zen.tsx     # Main app shell: state, handlers, shortcuts
│   ├── editor-pane.tsx    # A single editor with its toolbar
│   ├── monaco-editor.tsx  # Wrapped Monaco editor (lazy loaded)
│   ├── monaco-diff-editor.tsx # Wrapped Monaco diff editor (lazy loaded)
│   ├── theme-provider.tsx # next-themes provider
│   ├── theme-toggle.tsx   # Dark mode toggle
│   ├── icons.tsx          # Logo icon
│   └── ui/                # shadcn/ui components (button, select, toast, tooltip…)
├── hooks/
│   └── use-toast.ts       # Toast hook
└── lib/
    ├── formatters.ts      # JSON / XML / YAML pretty-printing
    ├── validators.ts      # JSON / XML / YAML validation
    ├── converters.ts      # JSON / XML / YAML conversion
    └── sorters.ts         # Key, array and element sorting
```

## Deployment

The repository includes `apphosting.yaml` for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). You can also deploy anywhere Next.js is supported (Vercel, Cloud Run, a Node server, etc.):

```bash
npm run build
npm run start
```

## License

This is a personal project — no license file is included yet.
