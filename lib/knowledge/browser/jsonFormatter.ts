/**
 * JSON Formatter for Excel Data
 * 
 * This module provides functionality to format JSON data from Excel files
 * for use in the knowledge base.
 */

export interface FormatOptions {
  indentSize: number;
  formatType: "standard" | "compact" | "array";
  includeNulls: boolean;
}

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  indentSize: 2,
  formatType: "standard",
  includeNulls: true,
};

/**
 * Format JSON data from Excel for display and storage
 * @param data The data to format
 * @param selectedHeaders The headers to include in the output
 * @param options Formatting options
 * @returns Formatted JSON string
 */
export function formatJsonOutput(
  data: any[], 
  selectedHeaders: string[], 
  options: Partial<FormatOptions> = {}
): string {
  // Merge default options with provided options
  const mergedOptions: FormatOptions = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...options,
  };
  
  const { indentSize, formatType, includeNulls } = mergedOptions;

  // Filter out headers that are empty strings or only whitespace
  const validHeaders = selectedHeaders.filter((header) => header.trim() !== "");

  // Filter data to only include selected headers
  const filteredData = data.map((row) => {
    const filteredRow: Record<string, any> = {};

    validHeaders.forEach((header) => {
      const value = row[header];

      // Skip null/empty values if includeNulls is false
      if (!includeNulls && (value === null || value === undefined || value === "")) {
        return;
      }

      filteredRow[header] = value;
    });

    return filteredRow;
  });

  // Format based on the selected format type
  if (formatType === "compact") {
    return JSON.stringify(filteredData);
  } else if (formatType === "array") {
    // Create array of arrays format with headers as first row
    const headerRow = validHeaders;
    const dataRows = filteredData.map((row) =>
      validHeaders.map((header) => (includeNulls ? row[header] || null : row[header])),
    );

    return JSON.stringify([headerRow, ...dataRows], null, indentSize);
  } else {
    // Standard format
    return JSON.stringify(filteredData, null, indentSize);
  }
}

/**
 * Convert formatted JSON to plain text for knowledge base storage
 * @param jsonData The formatted JSON string
 * @param title Optional title to include at the beginning
 * @returns Plain text representation of the data
 */
export function jsonToPlainText(jsonData: string, title?: string): string {
  try {
    const data = JSON.parse(jsonData);
    let result = '';
    
    // Add title if provided
    if (title) {
      result += `# ${title}\n\n`;
    }
    
    // Handle different data formats
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return result + 'No data available.';
      }
      
      // Check if it's array of arrays format (first element is headers)
      if (Array.isArray(data[0]) && data.length > 1) {
        const headers = data[0];
        result += headers.join('\t') + '\n';
        
        // Add separator line
        result += headers.map(() => '--------').join('\t') + '\n';
        
        // Add data rows
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          result += row.join('\t') + '\n';
        }
      } else {
        // It's an array of objects
        if (typeof data[0] === 'object' && data[0] !== null) {
          // Get all possible keys
          const allKeys = new Set();
          data.forEach(item => {
            if (item && typeof item === 'object') {
              Object.keys(item).forEach(key => allKeys.add(key));
            }
          });
          
          const keys = Array.from(allKeys);
          
          // Add header row
          result += keys.join('\t') + '\n';
          
          // Add separator line
          result += keys.map(() => '--------').join('\t') + '\n';
          
          // Add data rows
          data.forEach(item => {
            if (item && typeof item === 'object') {
              result += keys.map(key => item[key] || '').join('\t') + '\n';
            }
          });
        } else {
          // Simple array of values
          data.forEach(item => {
            result += String(item) + '\n';
          });
        }
      }
    } else if (typeof data === 'object' && data !== null) {
      // It's a simple object
      Object.entries(data).forEach(([key, value]) => {
        result += `${key}: ${value}\n`;
      });
    } else {
      // It's a primitive value
      result += String(data);
    }
    
    return result;
  } catch (error) {
    console.error('Error converting JSON to plain text:', error);
    return 'Error: Could not convert data to text format.';
  }
}
