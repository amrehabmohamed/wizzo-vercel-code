'use client';

import { useState } from 'react';
import { formatJsonOutput, jsonToPlainText } from '@/lib/knowledge/browser/jsonFormatter';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';

interface ExportPreviewProps {
  data: any[];
  selectedHeaders: string[];
  title: string;
  onTextContentChange: (content: string) => void;
}

export function ExcelExportPreview({ 
  data, 
  selectedHeaders,
  title,
  onTextContentChange
}: ExportPreviewProps) {
  const [indentSize, setIndentSize] = useState(2);
  const [formatType, setFormatType] = useState<"standard" | "compact" | "array">("standard");
  const [includeNulls, setIncludeNulls] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"json" | "text">("json");

  // Format JSON based on current settings
  const formattedJson = formatJsonOutput(data, selectedHeaders, {
    indentSize,
    formatType,
    includeNulls,
  });

  // Convert to plain text for knowledge base storage
  const plainText = jsonToPlainText(formattedJson, title);

  // Update parent component when text changes
  const handleFormatChange = () => {
    if (previewTab === "text") {
      onTextContentChange(plainText);
    } else {
      onTextContentChange(formattedJson);
    }
  };

  // Update text when format changes
  useState(() => {
    handleFormatChange();
  });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="text-lg font-medium dark:text-white">Format Options</div>
        <div className="text-sm text-muted-foreground dark:text-gray-300">
          Configure how your data will be formatted before adding to knowledge base.
        </div>
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="dark:text-white">Format Type</Label>
            <Tabs
              defaultValue="standard"
              value={formatType}
              onValueChange={(value) => {
                setFormatType(value as "standard" | "compact" | "array");
                setTimeout(handleFormatChange, 0);
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 dark:bg-hunter_green-700">
                <TabsTrigger 
                  value="standard"
                  className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white"
                >
                  Standard
                </TabsTrigger>
                <TabsTrigger 
                  value="compact"
                  className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white"
                >
                  Compact
                </TabsTrigger>
                <TabsTrigger 
                  value="array"
                  className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white"
                >
                  Array of Arrays
                </TabsTrigger>
              </TabsList>
              <TabsContent value="standard" className="p-4 border rounded-md mt-2 dark:border-hunter_green-500 dark:bg-hunter_green-700/30">
                <p className="text-sm text-muted-foreground dark:text-gray-300">
                  Standard JSON format with named properties for each record.
                </p>
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-x-auto dark:bg-hunter_green-800 dark:text-cornsilk-500">
                  {`[
  {
    "column1": "value1",
    "column2": "value2"
  }
]`}
                </pre>
              </TabsContent>
              <TabsContent value="compact" className="p-4 border rounded-md mt-2 dark:border-hunter_green-500 dark:bg-hunter_green-700/30">
                <p className="text-sm text-muted-foreground dark:text-gray-300">Compact format with minimal whitespace.</p>
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-x-auto dark:bg-hunter_green-800 dark:text-cornsilk-500">
                  {`[{"column1":"value1","column2":"value2"}]`}
                </pre>
              </TabsContent>
              <TabsContent value="array" className="p-4 border rounded-md mt-2 dark:border-hunter_green-500 dark:bg-hunter_green-700/30">
                <p className="text-sm text-muted-foreground dark:text-gray-300">
                  Array of arrays format with headers as the first array.
                </p>
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-x-auto dark:bg-hunter_green-800 dark:text-cornsilk-500">
                  {`[
  ["column1", "column2"],
  ["value1", "value2"]
]`}
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-white">Indentation</Label>
            <div className="flex items-center space-x-2">
              {[2, 4, 8].map((size) => (
                <Button
                  key={size}
                  variant={indentSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIndentSize(size);
                    setTimeout(handleFormatChange, 0);
                  }}
                  className={indentSize === size 
                    ? "dark:bg-hunter_green-500 dark:text-white" 
                    : "dark:bg-hunter_green-700 dark:text-white dark:border-hunter_green-500"
                  }
                >
                  {size} spaces
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-nulls"
              checked={includeNulls}
              onCheckedChange={(checked) => {
                setIncludeNulls(checked as boolean);
                setTimeout(handleFormatChange, 0);
              }}
              className="dark:border-hunter_green-300"
            />
            <Label htmlFor="include-nulls" className="dark:text-white">Include null/empty values</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium dark:text-white">Preview</div>
          <Tabs 
            value={previewTab} 
            onValueChange={(value) => {
              setPreviewTab(value as "json" | "text");
              setTimeout(() => {
                onTextContentChange(value === "json" ? formattedJson : plainText);
              }, 0);
            }}
            className="w-auto"
          >
            <TabsList className="dark:bg-hunter_green-700">
              <TabsTrigger 
                value="json"
                className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white"
              >
                JSON
              </TabsTrigger>
              <TabsTrigger 
                value="text"
                className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white"
              >
                Text
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="relative">
          <pre className="p-4 bg-muted rounded-md text-xs overflow-auto max-h-[300px] dark:bg-hunter_green-800 dark:text-cornsilk-500">
            {previewTab === "json" ? formattedJson : plainText}
          </pre>
          <div className="absolute top-2 right-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleCopyToClipboard(previewTab === "json" ? formattedJson : plainText)}
              className="dark:bg-hunter_green-700 dark:text-white dark:border-hunter_green-500"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
