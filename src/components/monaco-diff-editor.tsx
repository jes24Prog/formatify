"use client";

import dynamic from "next/dynamic";
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
}

export function MonacoDiffEditor({ original, modified, language }: MonacoDiffEditorProps) {
    return (
        <MonacoDiffEditorComponent
            height="100%"
            language={language}
            original={original}
            modified={modified}
            theme="vs"
            options={{ 
                readOnly: true,
                fontFamily: '"Source Code Pro", monospace',
                fontSize: 14,
                wordWrap: 'on'
            }}
        />
    );
}
