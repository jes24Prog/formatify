"use client";

import {
  ArrowLeft,
  ArrowRightLeft,
  Columns2,
  GitCompareArrows,
  PanelLeft,
  Repeat,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { EditorPane, type EditorType, type Language } from "@/components/editor-pane";
import { Icons } from "@/components/icons";
import {
  convertJsonToXml,
  convertJsonToYaml,
  convertXmlToJson,
  convertXmlToYaml,
  convertYamlToJson,
  convertYamlToXml,
} from "@/lib/converters";
import { formatJson, formatXml, formatYaml } from "@/lib/formatters";
import { sortJson, sortXml, sortYaml } from "@/lib/sorters";
import { validateJson, validateXml, validateYaml } from "@/lib/validators";
import { MonacoDiffEditor } from "./monaco-diff-editor";
import { ThemeToggle } from "./theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "formatify_session";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isConvertible(language: Language): boolean {
  return language === "json" || language === "xml" || language === "yaml";
}

export function FormatZen() {
  const [leftCode, setLeftCode] = useState("");
  const [rightCode, setRightCode] = useState("");
  const [leftLang, setLeftLang] = useState<Language>("json");
  const [rightLang, setRightLang] = useState<Language>("json");
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [sideBySide, setSideBySide] = useState(true);

  const isFirstRender = useRef(true);
  const { toast } = useToast();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as {
          leftCode?: string;
          rightCode?: string;
          leftLang?: Language;
          rightLang?: Language;
        };
        setLeftCode(parsed.leftCode ?? "");
        setRightCode(parsed.rightCode ?? "");
        if (parsed.leftLang && parsed.leftLang !== "plaintext") {
          setLeftLang(parsed.leftLang);
        }
        if (parsed.rightLang && parsed.rightLang !== "plaintext") {
          setRightLang(parsed.rightLang);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        leftCode,
        rightCode,
        leftLang,
        rightLang,
      })
    );
  }, [leftCode, rightCode, leftLang, rightLang]);

  const handleFormat = async (editor: EditorType) => {
    const code = editor === "left" ? leftCode : rightCode;
    const lang = editor === "left" ? leftLang : rightLang;
    const setCode = editor === "left" ? setLeftCode : setRightCode;

    if (code.trim() === "") {
      toast({
        title: "Nothing to format",
        description: "The editor is empty.",
        variant: "destructive",
      });
      return;
    }
    if (lang === "plaintext") {
      toast({
        title: "Cannot format plain text",
        variant: "destructive",
      });
      return;
    }

    try {
      const formatted =
        lang === "json"
          ? await formatJson(code)
          : lang === "xml"
            ? formatXml(code)
            : formatYaml(code);
      setCode(formatted);
      toast({ title: "Formatted successfully" });
    } catch (error) {
      toast({
        title: "Formatting failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleValidate = (editor: EditorType) => {
    const code = editor === "left" ? leftCode : rightCode;
    const lang = editor === "left" ? leftLang : rightLang;

    if (code.trim() === "") {
      toast({
        title: "Nothing to validate",
        description: "The editor is empty.",
        variant: "destructive",
      });
      return;
    }
    if (lang === "plaintext") {
      toast({
        title: "Plain text cannot be validated",
        variant: "destructive",
      });
      return;
    }

    const result =
      lang === "json"
        ? validateJson(code)
        : lang === "xml"
          ? validateXml(code)
          : validateYaml(code);

    if (result.isValid) {
      toast({
        title: "Validation successful",
        description: "The document is well-formed.",
      });
    } else {
      toast({
        title: "Validation failed",
        description: result.error ?? "Unknown error.",
        variant: "destructive",
      });
    }
  };

  const handleSort = (editor: EditorType) => {
    const code = editor === "left" ? leftCode : rightCode;
    const lang = editor === "left" ? leftLang : rightLang;
    const setCode = editor === "left" ? setLeftCode : setRightCode;

    if (code.trim() === "") {
      toast({
        title: "Nothing to sort",
        description: "The editor is empty.",
        variant: "destructive",
      });
      return;
    }
    if (lang === "plaintext") {
      toast({
        title: "Cannot sort plain text",
        variant: "destructive",
      });
      return;
    }

    try {
      const sorted =
        lang === "json"
          ? sortJson(code)
          : lang === "xml"
            ? sortXml(code)
            : sortYaml(code);
      setCode(sorted);
      toast({ title: "Sorted successfully" });
    } catch (error) {
      toast({
        title: "Sorting failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleSwap = () => {
    setLeftCode(rightCode);
    setRightCode(leftCode);
    setLeftLang(rightLang);
    setRightLang(leftLang);
    toast({ title: "Panes swapped" });
  };

  const handleConvert = () => {
    if (leftCode.trim() === "") {
      toast({
        title: "Left editor is empty",
        description: "Add content before converting.",
        variant: "destructive",
      });
      return;
    }
    if (!isConvertible(leftLang) || !isConvertible(rightLang)) {
      toast({
        title: "Conversion not supported",
        description: "Select JSON, XML or YAML for both panes.",
        variant: "destructive",
      });
      return;
    }
    if (leftLang === rightLang) {
      toast({
        title: "Same format on both sides",
        description:
          "Set different languages to convert, or use the swap button to switch sides.",
        variant: "destructive",
      });
      return;
    }

    try {
      let converted: string;
      switch (leftLang) {
        case "xml":
          converted =
            rightLang === "json"
              ? JSON.stringify(convertXmlToJson(leftCode), null, 2)
              : convertXmlToYaml(leftCode);
          break;
        case "yaml":
          converted =
            rightLang === "json"
              ? JSON.stringify(convertYamlToJson(leftCode), null, 2)
              : convertYamlToXml(leftCode);
          break;
        default:
          converted =
            rightLang === "xml"
              ? convertJsonToXml(leftCode)
              : convertJsonToYaml(leftCode);
      }
      setRightCode(converted);
      toast({
        title: `Converted ${leftLang.toUpperCase()} to ${rightLang.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleCompare = () => {
    if (leftLang !== rightLang) {
      toast({
        title: "Cannot compare different formats",
        description: "Both panes must use the same language.",
        variant: "destructive",
      });
      return;
    }
    if (leftLang === "plaintext" || rightLang === "plaintext") {
      toast({
        title: "Cannot compare plain text",
        description: "Select JSON, XML or YAML for both panes.",
        variant: "destructive",
      });
      return;
    }
    setIsDiffMode(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.altKey) return;
      const key = event.key.toLowerCase();
      switch (key) {
        case "f":
          event.preventDefault();
          handleFormat("left");
          break;
        case "g":
          event.preventDefault();
          handleFormat("right");
          break;
        case "x":
          event.preventDefault();
          handleSwap();
          break;
        case "v":
          event.preventDefault();
          handleConvert();
          break;
        case "d":
          event.preventDefault();
          if (isDiffMode) {
            setIsDiffMode(false);
          } else {
            handleCompare();
          }
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="flex flex-col h-dvh">
      <TooltipProvider>
        <header className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-card shrink-0 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Icons.logo className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold leading-tight font-headline">
                Formatify
              </h1>
              <p className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
                JSON · XML · YAML
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isDiffMode ? (
              <>
                <Button
                  onClick={() => setIsDiffMode(false)}
                  variant="outline"
                  className="h-9"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Editors
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSideBySide((v) => !v)}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                    >
                      {sideBySide ? (
                        <PanelLeft className="h-4 w-4" />
                      ) : (
                        <Columns2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{sideBySide ? "Switch to inline diff" : "Side-by-side diff"}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleSwap}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Swap panes (Ctrl/⌘ + Alt + X)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleConvert}
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                    >
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Convert left to right (Ctrl/⌘ + Alt + V)</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCompare}
                      variant="outline"
                      className="h-9"
                    >
                      <GitCompareArrows className="h-4 w-4 mr-1.5" />
                      Compare
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compare files (Ctrl/⌘ + Alt + D)</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <div className="h-6 w-px bg-border mx-1" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 min-h-0">
          {isDiffMode ? (
            <div className="w-full h-full p-2 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <span className="font-medium uppercase tracking-wide">
                  {leftLang.toUpperCase()}
                </span>
                <span>·</span>
                <span>Diff view</span>
                <span className="ml-auto tabular-nums">
                  {rightCode === leftCode ? "No differences" : "Differences found"}
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <MonacoDiffEditor
                  original={leftCode}
                  modified={rightCode}
                  language={leftLang}
                  renderSideBySide={sideBySide}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row p-2 gap-2 h-full overflow-y-auto lg:overflow-hidden">
              <EditorPane
                editorType="left"
                code={leftCode}
                onCodeChange={setLeftCode}
                language={leftLang}
                onLanguageChange={setLeftLang}
                onFormat={handleFormat}
                onValidate={handleValidate}
                onSort={handleSort}
              />
              <EditorPane
                editorType="right"
                code={rightCode}
                onCodeChange={setRightCode}
                language={rightLang}
                onLanguageChange={setRightLang}
                onFormat={handleFormat}
                onValidate={handleValidate}
                onSort={handleSort}
              />
            </div>
          )}
        </main>
      </TooltipProvider>
    </div>
  );
}

