# Formatify

Formatify is a powerful and intuitive web-based tool designed to beautify, validate, convert, and compare XML and JSON files with ease. Built with modern web technologies, it provides a seamless and responsive experience for developers and data analysts.

## Key Features

- **Dual Editor Interface**: Work with two files side-by-side in a responsive layout that adapts to your screen size. On smaller screens, the editors stack vertically for improved usability.
- **Syntax Highlighting**: Code editors powered by Monaco Editor (the engine behind VS Code) provide excellent readability and a familiar editing experience.
- **Beautify/Format**: Clean up and indent your JSON or XML files with a single click to make them more readable, powered by Prettier and `xml-formatter`.
- **Validate**: Instantly check your files for syntactical correctness and get clear, actionable error messages.
- **Convert between XML and JSON**: Seamlessly convert data between XML and JSON formats. The tool intelligently detects the source and target format based on your editor settings.
- **File Comparison (Diffing)**: Activate the "Compare" mode to see a side-by-side diff view that highlights insertions and deletions, making it easy to spot differences between two files.
- **File Operations**:
    - Open local files or drag-and-drop them directly into the editors.
    - Paste content from the clipboard.
    - Copy, clear, or download the editor content.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Parsing/Formatting**: `fast-xml-parser`, `prettier`, `xml-formatter`

## Getting Started

To run the project locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## Project Structure

- `src/app/`: Contains the main application pages and layouts.
- `src/components/`: Contains the React components, including the main `FormatZen` component and the UI components from ShadCN.
- `src/lib/`: Contains utility functions for formatting (`formatters.ts`), validation (`validators.ts`), and conversion (`converters.ts`).
- `public/`: Contains static assets.
- `tailwind.config.ts`: Configuration file for Tailwind CSS.
- `next.config.ts`: Configuration file for Next.js.