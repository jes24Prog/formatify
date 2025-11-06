
"use client";

import { useRef, useCallback } from 'react';
import {
  FileUp,
  ClipboardPaste,
  Sparkles,
  ShieldCheck,
  Copy,
  Trash2,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonacoEditor } from '@/components/monaco-editor';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export type EditorType = 'left' | 'right';
type Language = 'json' | 'xml' | 'plaintext';

interface EditorPaneProps {
  editorType: EditorType;
  code: string;
  onCodeChange: (code: string) => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onFormat: (editor: EditorType) => void;
  onValidate: (editor: EditorType) => void;
}

export function EditorPane({
  editorType,
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onFormat,
  onValidate,
}: EditorPaneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onCodeChange(content);
        // Auto-detect language
        if (file.name.endsWith('.json')) onLanguageChange('json');
        else if (file.name.endsWith('.xml')) onLanguageChange('xml');
      };
      reader.readAsText(file);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onCodeChange(text);
      toast({ title: 'Pasted from clipboard!' });
    } catch (error) {
      toast({ title: 'Failed to paste', description: 'Could not read from clipboard.', variant: 'destructive' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const handleClear = () => {
    onCodeChange('');
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `file.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCodeChange(e.target?.result as string);
        if (file.name.endsWith('.json')) onLanguageChange('json');
        else if (file.name.endsWith('.xml')) onLanguageChange('xml');
        toast({ title: "File loaded successfully!" });
      };
      reader.readAsText(file);
    }
  }, [onCodeChange, onLanguageChange, toast]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col border rounded-md lg:min-h-0" onDrop={onDrop} onDragOver={onDragOver}>
        <div className="flex items-center justify-between p-2 border-b bg-card flex-wrap">
          <Select value={language} onValueChange={(v) => onLanguageChange(v as Language)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="plaintext">Plain Text</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleFileOpen}><FileUp className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Open File</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handlePaste}><ClipboardPaste className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Paste</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onFormat(editorType)}><Sparkles className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Beautify</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onValidate(editorType)}><ShieldCheck className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Validate</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Copy</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleDownload}><Download className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Download</p></TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleClear} className="text-destructive hover:text-destructive"><Trash2 className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent><p>Clear</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="flex-1 relative">
            <MonacoEditor
                language={language}
                value={code}
                onChange={(value) => onCodeChange(value || '')}
            />
        </div>
      </div>
    </TooltipProvider>
  );
}
