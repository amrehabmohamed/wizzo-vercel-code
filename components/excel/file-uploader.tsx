'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileUp } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export function ExcelFileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) {
      setSelectedFile(file);
    } else {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-4 border rounded-md bg-muted/30 dark:bg-hunter_green-600 dark:border-hunter_green-500">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-hunter_green-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          accept=".xlsx,.xls" 
          onChange={handleChange} 
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full dark:bg-hunter_green-500/20">
            <Upload className="h-10 w-10 text-primary dark:text-white" />
          </div>
          <h3 className="text-lg font-semibold dark:text-white">Drag and drop your Excel file here</h3>
          <p className="text-sm text-muted-foreground dark:text-gray-300">or</p>
          <Button 
            type="button" 
            variant="outline" 
            onClick={openFileSelector} 
            disabled={isLoading}
            className="dark:bg-hunter_green-500 dark:text-white dark:border-hunter_green-400 dark:hover:bg-hunter_green-400"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground dark:text-gray-300">Supports .xlsx and .xls files</p>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-muted rounded-lg dark:bg-hunter_green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileUp className="h-5 w-5 text-primary dark:text-white" />
              <span className="font-medium dark:text-white">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground dark:text-gray-300">
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={isLoading}
              className="dark:bg-hunter_green-500 dark:text-white dark:border-hunter_green-400 dark:hover:bg-hunter_green-400"
            >
              {isLoading ? "Processing..." : "Process File"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
