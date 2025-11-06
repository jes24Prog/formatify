
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { type Delta } from "jsondiffpatch";
import { MonacoEditor } from "./monaco-editor";
import { formatJson } from "@/lib/formatters";

interface StructuralDiffViewProps {
  diff: Delta | undefined;
}

export function StructuralDiffView({ diff }: StructuralDiffViewProps) {
  const [formattedDiff, setFormattedDiff] = useState("");

  useEffect(() => {
    const format = async () => {
      if (diff) {
        try {
          const formatted = await formatJson(JSON.stringify(diff));
          setFormattedDiff(formatted);
        } catch (e) {
          // if formatting fails, show the raw diff
          setFormattedDiff(JSON.stringify(diff, null, 2));
        }
      } else {
        setFormattedDiff("");
      }
    };
    format();
  }, [diff]);

  if (!diff) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground rounded-lg border">
        <p>Run a comparison to see the structural diff here.</p>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Structural Differences</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 h-full p-0">
        <div className="h-full w-full border rounded-md">
          <MonacoEditor
            language="json"
            value={formattedDiff}
            onChange={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}
