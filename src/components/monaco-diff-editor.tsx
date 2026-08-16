"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

import { Skeleton } from "./ui/skeleton";

const MonacoDiffEditorComponent = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
);

interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  language: string;
  renderSideBySide: boolean;
}

export function MonacoDiffEditor({
  original,
  modified,
  language,
  renderSideBySide,
}: MonacoDiffEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <MonacoDiffEditorComponent
      height="100%"
      language={language}
      original={original}
      modified={modified}
      theme={isDark ? "vs-dark" : "vs"}
      options={{
        readOnly: true,
        renderSideBySide,
        minimap: { enabled: false },
        fontFamily: "var(--font-code), 'Source Code Pro', monospace",
        fontSize: 14,
        lineHeight: 21,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        padding: { top: 8, bottom: 8 },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        automaticLayout: true,
      }}
    />
  );
}
