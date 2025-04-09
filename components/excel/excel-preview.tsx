'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Clipboard, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { jsonToPlainText, formatJsonOutput } from '@/lib/knowledge/browser/jsonFormatter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExcelPreviewProps {
  data: any[];
  selectedHeaders: string[];
  title: string;
  onContentChange: (content: string) => void;
}

export function ExcelPreview({
  data,
  selectedHeaders,
  title,
  onContentChange
}: ExcelPreviewProps) {
  const [formatType, setFormatType] = useState<'standard' | 'compact' | 'array'>('standard');
  const [includeNulls, setIncludeNulls] = useState(true);
  const [textContent, setTextContent] = useState('');
  const [jsonContent, setJsonContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'json'>('text');

  // Generate formatted content
  useEffect(() => {
    if (selectedHeaders.length > 0 && data.length > 0) {
      // Format JSON based on current options
      const formattedJson = formatJsonOutput(data, selectedHeaders, {
        indentSize: 2,
        formatType,
        includeNulls,
      });
      
      // Convert JSON to text format
      const formattedText = jsonToPlainText(formattedJson, title);
      setTextContent(formattedText);
      setJsonContent(formattedJson);
      
      // Update parent content based on active tab
      if (activeTab === 'text') {
        onContentChange(formattedText);
      } else {
        onContentChange(formattedJson);
      }
    } else {
      const noDataText = 'No data to display. Please select columns in the Configure tab.';
      setTextContent(noDataText);
      setJsonContent('[]');
      onContentChange('');
    }
  }, [data, selectedHeaders, title, formatType, includeNulls, onContentChange, activeTab]);

  const handleTextContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    onContentChange(e.target.value);
  };
  
  const handleJsonContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    onContentChange(e.target.value);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'text' | 'json');
    onContentChange(value === 'text' ? textContent : jsonContent);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(activeTab === 'text' ? textContent : jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-hunter_green-700 pt-2 pb-4">
        <div className="text-lg font-medium dark:text-white">Edit Content</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 dark:hover:bg-hunter_green-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        You can edit the content before adding it to your knowledge base.
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 dark:bg-hunter_green-700">
          <TabsTrigger value="text" className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white">Text</TabsTrigger>
          <TabsTrigger value="json" className="dark:data-[state=active]:bg-hunter_green-500 dark:data-[state=active]:text-white">JSON</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="mt-0">
          <Textarea
            value={textContent}
            onChange={handleTextContentChange}
            readOnly={false}
            className="min-h-[350px] font-mono dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 cursor-text"
            placeholder="No data to display. Please select columns in the Configure tab."
            onFocus={(e) => e.target.select()}
          />
        </TabsContent>
        
        <TabsContent value="json" className="mt-0">
          <div className="relative">
            <Textarea
              value={jsonContent}
              onChange={handleJsonContentChange}
              readOnly={false}
              className="min-h-[350px] font-mono dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 cursor-text"
              placeholder="No JSON data available."
              onFocus={(e) => e.target.select()}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
