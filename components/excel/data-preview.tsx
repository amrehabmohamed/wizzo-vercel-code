'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface DataPreviewProps {
  data: any[];
  headers: string[];
  selectedHeaders: string[];
}

export function ExcelDataPreview({ data, headers, selectedHeaders }: DataPreviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    ),
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      <div className="flex justify-between items-center sticky top-0 z-10 bg-white dark:bg-hunter_green-700 pt-2 pb-4">
        <div className="text-lg font-medium dark:text-white">Data Preview</div>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500"
          />
          <Button type="submit" size="icon" variant="ghost" className="dark:text-white">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground dark:text-gray-300">
        The first row has been identified as column headers. Preview your data and configure columns below.
      </div>
      
      <div className="rounded-md border overflow-auto max-h-[300px] dark:border-hunter_green-500 my-4 mx-0" style={{ overflowX: 'auto', overflowY: 'auto' }}>
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="dark:bg-hunter_green-800 dark:hover:bg-hunter_green-700">
              {selectedHeaders.map((header) => (
                <TableHead key={header} className="whitespace-nowrap dark:text-white">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="dark:hover:bg-hunter_green-700">
                  {selectedHeaders.map((header, cellIndex) => (
                    <TableCell key={`${rowIndex}-${cellIndex}`} className="whitespace-nowrap dark:text-cornsilk-500">
                      {row[header] !== undefined ? String(row[header]) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={selectedHeaders.length} className="h-24 text-center dark:text-white">
                  {searchTerm ? "No results found." : "No data available."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 dark:hover:bg-hunter_green-700"
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="dark:bg-hunter_green-600 dark:text-white dark:border-hunter_green-500 dark:hover:bg-hunter_green-700"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
