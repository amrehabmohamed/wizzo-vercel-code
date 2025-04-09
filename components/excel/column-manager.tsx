'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, GripVertical, X } from 'lucide-react';

interface ColumnManagerProps {
  headers: string[];
  selectedHeaders: string[];
  onHeaderSelection: (selectedHeaders: string[]) => void;
  onHeaderReorder: (reorderedHeaders: string[]) => void;
}

export function ExcelColumnManager({ 
  headers, 
  selectedHeaders, 
  onHeaderSelection, 
  onHeaderReorder 
}: ColumnManagerProps) {
  const [localSelectedHeaders, setLocalSelectedHeaders] = useState<string[]>(selectedHeaders);

  const handleHeaderToggle = (header: string) => {
    const updatedHeaders = localSelectedHeaders.includes(header)
      ? localSelectedHeaders.filter((h) => h !== header)
      : [...localSelectedHeaders, header];

    setLocalSelectedHeaders(updatedHeaders);
    onHeaderSelection(updatedHeaders);
  };

  const moveHeader = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === localSelectedHeaders.length - 1)) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newHeaders = [...localSelectedHeaders];
    const temp = newHeaders[index];
    newHeaders[index] = newHeaders[newIndex];
    newHeaders[newIndex] = temp;

    setLocalSelectedHeaders(newHeaders);
    onHeaderReorder(newHeaders);
  };

  const deleteHeader = (header: string) => {
    const updatedHeaders = localSelectedHeaders.filter((h) => h !== header);
    setLocalSelectedHeaders(updatedHeaders);
    onHeaderSelection(updatedHeaders);
  };

  const selectAll = () => {
    setLocalSelectedHeaders([...headers]);
    onHeaderSelection([...headers]);
  };

  const deselectAll = () => {
    setLocalSelectedHeaders([]);
    onHeaderSelection([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium dark:text-white">Configure Columns</div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={selectAll}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 dark:hover:bg-hunter_green-700"
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={deselectAll}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 dark:hover:bg-hunter_green-700"
          >
            Deselect All
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        Select which columns to include in the output, rearrange their order, or delete columns.
      </div>
      
      <div className="grid gap-4 mt-2">
        {localSelectedHeaders.map((header, index) => (
          <div key={header} className="flex items-center justify-between p-2 border rounded-md bg-background dark:bg-hunter_green-600 dark:border-hunter_green-500">
            <div className="flex items-center space-x-3">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move dark:text-gray-300" />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`header-${index}`} 
                  checked={true} 
                  onCheckedChange={() => handleHeaderToggle(header)} 
                  className="dark:border-hunter_green-300"
                />
                <Label htmlFor={`header-${index}`} className="font-medium dark:text-white">
                  {header}
                </Label>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => moveHeader(index, "up")} 
                disabled={index === 0}
                className="dark:text-white dark:hover:bg-hunter_green-700"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => moveHeader(index, "down")} 
                disabled={index === localSelectedHeaders.length - 1}
                className="dark:text-white dark:hover:bg-hunter_green-700"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 dark:text-red-400 dark:hover:bg-red-800/20"
                onClick={() => deleteHeader(header)}
                title="Delete column"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {headers
          .filter((header) => !localSelectedHeaders.includes(header))
          .map((header, index) => (
            <div key={header} className="flex items-center p-2 border rounded-md bg-muted/50 dark:bg-hunter_green-700/50 dark:border-hunter_green-600">
              <div className="flex items-center space-x-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move dark:text-gray-400" />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`unselected-header-${index}`}
                    checked={false}
                    onCheckedChange={() => handleHeaderToggle(header)}
                    className="dark:border-hunter_green-400"
                  />
                  <Label htmlFor={`unselected-header-${index}`} className="font-medium text-muted-foreground dark:text-gray-400">
                    {header}
                  </Label>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
