'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { jsonToPlainText, formatJsonOutput } from '@/lib/knowledge/browser/jsonFormatter';

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
  const [copied, setCopied] = useState(false);

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
      onContentChange(formattedText);
    } else {
      const noDataText = 'No data to display. Please select columns in the Configure tab.';
      setTextContent(noDataText);
      onContentChange('');
    }
  }, [data, selectedHeaders, title, formatType, includeNulls, onContentChange]);

  const handleTextContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    onContentChange(e.target.value);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium dark:text-white">Edit Content</div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 dark:hover:bg-hunter_green-700"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        You can edit the content before adding it to your knowledge base.
      </div>
      
      <Textarea
        value={textContent}
        onChange={handleTextContentChange}
        className="min-h-[350px] font-mono dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500"
        placeholder="No data to display. Please select columns in the Configure tab."
      />
    </div>
  );
}
