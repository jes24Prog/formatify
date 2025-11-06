"use client";

import dynamic from "next/dynamic";
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
    return (
        <MonacoEditorComponent
            height="100%"
            language={language}
            value={value}
            onChange={onChange}
            theme="vs"
            options={{ 
                minimap: { enabled: false },
                fontFamily: '"Source Code Pro", monospace',
                fontSize: 14,
                wordWrap: 'on'
            }}
        />
    );
}
