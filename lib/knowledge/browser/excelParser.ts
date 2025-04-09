/**
 * Excel File Parser for Wizzo Knowledge Base
 * 
 * This module provides functionality to parse Excel files (.xlsx, .xls) 
 * and convert them to structured data for the knowledge base.
 */
import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  data: any[];
  headers: string[];
}

/**
 * Parse an Excel file and extract its data and headers
 * @param file The Excel file to parse
 * @returns Promise resolving to the parsed data and headers
 */
export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "", // Default value for empty cells
          raw: false, // Convert all data to strings
        });

        // Extract headers from the first row
        let headers = Object.keys(jsonData[0] || {});

        // Filter out empty headers (titles)
        headers = headers.filter((header) => header.trim() !== "");

        // Filter out completely empty columns
        headers = headers.filter((header) => {
          // Check if the column has at least one non-empty value
          return jsonData.some((row) => row[header] !== "" && row[header] !== null && row[header] !== undefined);
        });

        resolve({
          data: jsonData,
          headers,
        });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
}
