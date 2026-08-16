"use client";

import {
  ArrowUpDown,
  ClipboardPaste,
  Copy,
  Download,
  FileUp,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { MonacoEditor } from "@/components/monaco-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { validateJson, validateXml, validateYaml } from "@/lib/validators";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type EditorType = "left" | "right";
export type Language = "json" | "xml" | "yaml" | "plaintext";

interface EditorPaneProps {
  editorType: EditorType;
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onFormat: (editor: EditorType) => void;
  onValidate: (editor: EditorType) => void;
  onSort: (editor: EditorType) => void;
}

type Status = "empty" | "valid" | "invalid" | "n/a";

const LANGUAGE_LABELS: Record<Language, string> = {
  json: "JSON",
  xml: "XML",
  yaml: "YAML",
  plaintext: "Text",
};

function getStatus(code: string, language: Language): Status {
  if (code.trim() === "") return "empty";
  if (language === "plaintext") return "n/a";
  const result =
    language === "json"
      ? validateJson(code)
      : language === "xml"
        ? validateXml(code)
        : validateYaml(code);
  return result.isValid ? "valid" : "invalid";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function EditorPane({
  editorType,
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onFormat,
  onValidate,
  onSort,
}: EditorPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const deferredCode = useDeferredValue(code);

  const status = useMemo(
    () => getStatus(deferredCode, language),
    [deferredCode, language]
  );

  const lineCount = useMemo(() => {
    if (code === "") return 0;
    return code.split("\n").length;
  }, [code]);

  const sizeLabel = useMemo(
    () => formatBytes(new Blob([code]).size),
    [code]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCodeChange((e.target?.result as string) ?? "");
        onLanguageChange(detectLanguage(file.name));
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onCodeChange(text);
      toast({ title: "Pasted from clipboard" });
    } catch {
      toast({
        title: "Failed to paste",
        description: "Could not read from clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not write to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    onCodeChange("");
    toast({ title: "Editor cleared" });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatify.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onCodeChange((e.target?.result as string) ?? "");
          onLanguageChange(detectLanguage(file.name));
          toast({ title: "File loaded" });
        };
        reader.readAsText(file);
      }
    },
    [onCodeChange, onLanguageChange, toast]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const statusInfo = {
    empty: { label: "Empty", dot: "bg-muted-foreground/40" },
    valid: { label: "Valid", dot: "bg-success" },
    invalid: { label: "Invalid", dot: "bg-destructive" },
    "n/a": { label: "Plain text", dot: "bg-warning" },
  }[status];

  return (
    <TooltipProvider>
      <div
        className={`flex-1 flex flex-col border rounded-lg overflow-hidden bg-card min-h-0 ${
          isDragOver
            ? "border-primary ring-2 ring-primary/30"
            : "border-border"
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b bg-muted/40">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">
              {editorType === "left" ? "Left" : "Right"}
            </span>
            <Select
              value={language}
              onValueChange={(v) => onLanguageChange(v as Language)}
            >
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="plaintext">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-0.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open file</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePaste}
                >
                  <ClipboardPaste className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paste from clipboard</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onFormat(editorType)}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Beautify</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onValidate(editorType)}
                >
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Validate</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSort(editorType)}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sort</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleClear}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="relative flex-1 min-h-0">
          <MonacoEditor
            language={language}
            value={code}
            onChange={(value) => onCodeChange(value ?? "")}
          />
          {code.trim() === "" && !isDragOver && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center p-6"
              aria-hidden
            >
              <div className="text-center space-y-2 max-w-xs">
                <FileUp className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop a file here, paste your code, or use the
                  toolbar to get started.
                </p>
              </div>
            </div>
          )}
          {isDragOver && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg border-2 border-dashed border-primary px-8 py-6 bg-background/80">
                <p className="text-sm font-medium text-primary">
                  Drop file to load
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-1 border-t bg-muted/40 text-[11px] text-muted-foreground tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
            <span>{statusInfo.label}</span>
            <span className="text-muted-foreground/50">
              · {LANGUAGE_LABELS[language]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </span>
            <span>{sizeLabel}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function detectLanguage(fileName: string): Language {
  if (fileName.endsWith(".json")) return "json";
  if (fileName.endsWith(".xml")) return "xml";
  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) return "yaml";
  return "plaintext";
}
