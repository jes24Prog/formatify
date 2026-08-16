"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

import { Skeleton } from "./ui/skeleton";

const MonacoEditorComponent = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
);

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

export function MonacoEditor({ language, value, onChange }: MonacoEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <MonacoEditorComponent
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme={isDark ? "vs-dark" : "vs"}
      options={{
        minimap: { enabled: false },
        fontFamily: "var(--font-code), 'Source Code Pro', monospace",
        fontSize: 14,
        lineHeight: 21,
        wordWrap: "on",
        tabSize: 2,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        padding: { top: 8, bottom: 8 },
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        automaticLayout: true,
      }}
    />
  );
}
