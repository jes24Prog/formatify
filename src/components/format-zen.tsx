
"use client";

import { useState, useEffect } from 'react';
import { ArrowRightLeft, GitCompareArrows, ArrowLeft, Repeat } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EditorPane, EditorType } from '@/components/editor-pane';
import { formatJson, formatXml, formatYaml } from '@/lib/formatters';
import { validateJson, validateXml, validateYaml } from '@/lib/validators';
import { Icons } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { MonacoDiffEditor } from './monaco-diff-editor';
import { convertJsonToXml, convertXmlToJson, convertJsonToYaml, convertYamlToJson } from '@/lib/converters';

type Language = 'json' | 'xml' | 'plaintext' | 'yaml';

export function FormatZen() {
  const [leftCode, setLeftCode] = useState('');
  const [rightCode, setRightCode] = useState('');
  const [leftLang, setLeftLang] = useState<Language>('json');
  const [rightLang, setRightLang] = useState<Language>('json');
  const [isClient, setIsClient] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    
    const savedState = localStorage.getItem('formatzen_session');
    if (savedState) {
      try {
        const { leftCode, rightCode, leftLang, rightLang } = JSON.parse(savedState);
        setLeftCode(leftCode || '');
        setRightCode(rightCode || '');
        setLeftLang(leftLang || 'json');
        setRightLang(rightLang || 'json');
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      const session = { leftCode, rightCode, leftLang, rightLang };
      localStorage.setItem('formatzen_session', JSON.stringify(session));
    }
  }, [leftCode, rightCode, leftLang, rightLang, isClient]);

  const handleFormat = async (editor: EditorType) => {
    const code = editor === 'left' ? leftCode : rightCode;
    const lang = editor === 'left' ? leftLang : rightLang;
    const setCode = editor === 'left' ? setLeftCode : setRightCode;

    try {
      let formatted = '';
      if (lang === 'json') {
        formatted = await formatJson(code);
      } else if (lang === 'xml') {
        formatted = formatXml(code);
      } else if (lang === 'yaml') {
        formatted = formatYaml(code);
      } else {
        toast({ title: 'Cannot format plaintext', variant: 'destructive' });
        return;
      }
      setCode(formatted);
      toast({ title: 'Code formatted successfully!' });
    } catch (e: any) {
      toast({ title: 'Formatting failed', description: e.message, variant: 'destructive' });
    }
  };
  
  const handleValidate = (editor: EditorType) => {
    const code = editor === 'left' ? leftCode : rightCode;
    const lang = editor === 'left' ? leftLang : rightLang;

    let result = { isValid: false, error: 'Unsupported language' };
    if (lang === 'json') {
      result = validateJson(code);
    } else if (lang === 'xml') {
      result = validateXml(code);
    } else if (lang === 'yaml') {
      result = validateYaml(code);
    }

    if (result.isValid) {
      toast({ title: 'Validation successful!', description: 'The code is well-formed.' });
    } else {
      toast({ title: 'Validation failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleSwap = () => {
    setLeftCode(rightCode);
    setRightCode(leftCode);
    setLeftLang(rightLang);
    setRightLang(leftLang);
    toast({ title: 'Panes swapped!' });
  };
  
  const handleConvert = () => {
    try {
      if (leftLang === 'xml' && rightLang === 'json') {
        const json = convertXmlToJson(leftCode);
        setRightCode(JSON.stringify(json, null, 2));
        toast({ title: "Converted XML to JSON" });
      } else if (leftLang === 'json' && rightLang === 'xml') {
        const xml = convertJsonToXml(leftCode);
        setRightCode(xml);
        toast({ title: "Converted JSON to XML" });
      } else if (leftLang === 'json' && rightLang === 'yaml') {
        const yaml = convertJsonToYaml(leftCode);
        setRightCode(yaml);
        toast({ title: "Converted JSON to YAML" });
      } else if (leftLang === 'yaml' && rightLang === 'json') {
        const json = convertYamlToJson(leftCode);
        setRightCode(JSON.stringify(json, null, 2));
        toast({ title: "Converted YAML to JSON" });
      } else if (leftLang === 'xml' && rightLang === 'yaml') {
        const json = convertXmlToJson(leftCode);
        const yaml = convertJsonToYaml(JSON.stringify(json));
        setRightCode(yaml);
        toast({ title: "Converted XML to YAML" });
      } else if (leftLang === 'yaml' && rightLang === 'xml') {
        const json = convertYamlToJson(leftCode);
        const xml = convertJsonToXml(JSON.stringify(json));
        setRightCode(xml);
        toast({ title: "Converted YAML to XML" });
      } else {
        toast({
          title: "Conversion not supported",
          description: "Please set panes to compatible types (JSON, XML, YAML).",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Conversion Failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleCompare = () => {
    if (leftLang !== rightLang) {
      toast({
        title: "Cannot compare different languages",
        variant: "destructive",
      });
      return;
    }
    if (leftLang === 'plaintext' || rightLang === 'plaintext') {
        toast({
            title: "Cannot compare this file type",
            description: "Please select JSON, XML or YAML for both panes to compare.",
            variant: "destructive",
        });
        return;
    }
    setIsDiffMode(true);
  };

  return (
    <div className="flex flex-col h-screen">
      <TooltipProvider>
        <div className="flex-1 flex flex-col min-h-0">
          <header className="flex items-center justify-between p-2 border-b shrink-0 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Icons.logo className="h-7 w-7 text-primary" />
              <h1 className="text-xl font-bold font-headline">Formatify</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {isDiffMode ? (
                 <Button onClick={() => setIsDiffMode(false)} variant="outline">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Editors
                  </Button>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleSwap} variant="outline" size="icon">
                        <ArrowRightLeft className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Swap Panes</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleConvert} variant="outline" size="icon">
                        <Repeat className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Convert</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleCompare} variant="outline">
                        <GitCompareArrows className="h-5 w-5 mr-2" />
                        Compare
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compare Files</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 min-h-0">
            {isDiffMode ? (
               <div className="w-full h-full p-2">
                 <MonacoDiffEditor
                    original={leftCode}
                    modified={rightCode}
                    language={leftLang}
                  />
               </div>
            ) : (
              <div className="flex flex-col lg:flex-row p-2 gap-2 h-full">
                <EditorPane
                  editorType="left"
                  code={leftCode}
                  onCodeChange={setLeftCode}
                  language={leftLang}
                  onLanguageChange={setLeftLang}
                  onFormat={handleFormat}
                  onValidate={handleValidate}
                />
                <EditorPane
                  editorType="right"
                  code={rightCode}
                  onCodeChange={setRightCode}
                  language={rightLang}
                  onLanguageChange={setRightLang}
                  onFormat={handleFormat}
                  onValidate={handleValidate}
                />
              </div>
            )}
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
