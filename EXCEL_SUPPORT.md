# Excel Support for Wizzo Knowledge Base

This feature enables users to add Excel spreadsheet data to the knowledge base with a streamlined workflow.

## Installation

1. Install the required dependencies:

```bash
npm install xlsx --legacy-peer-deps
```

Note: The `--legacy-peer-deps` flag is required due to peer dependency conflicts with the React 19 RC version.

## Features

- Upload Excel (.xlsx and .xls) files directly to your knowledge base
- Preview spreadsheet data before adding it
- Configure which columns to include or exclude
- Reorder columns as needed
- Delete specific columns that are not required
- Edit the formatted data before final submission
- Empty columns and titles are automatically filtered out

## Usage Instructions

1. Click "Add Document" in the knowledge base interface
2. Select the "Excel Files" tab
3. Follow the multi-step process:

   - **Upload**: Drag and drop or browse for an Excel file
   - **Preview**: View your data in a paginated table
   - **Configure**: Select, reorder, or delete columns
   - **Edit Content**: Make any final edits to the formatted text
   - **Add to Knowledge**: Submit the processed data

## How It Works

1. **File Upload**: The Excel file is parsed using the SheetJS library (xlsx)
2. **Data Extraction**: The first worksheet is converted to JSON with headers
3. **Column Management**: Users can select which columns to include
4. **Format Conversion**: Selected data is converted to a tabular text format
5. **Text Editing**: Users can make final edits to the formatted text
6. **Knowledge Storage**: Data is stored as a text document in the knowledge base

## Technical Implementation

- The implementation uses the SheetJS `xlsx` library for Excel parsing
- Excel data is processed client-side to avoid server load
- The feature integrates with the existing knowledge-upload component
- Data is saved in a tabular text format for optimal retrieval
- Empty columns and empty titles are automatically filtered out for clean data

## Tips

- For large Excel files, use the search functionality in the preview screen
- Remove unnecessary columns early in the process
- The Edit Content screen allows you to add context or additional information
- Uploaded Excel data is processed as a text document, making it searchable in the knowledge base

## Requirements

- Supported Excel formats: .xlsx, .xls
- File size limit follows the same rules as other knowledge uploads
- First row of the spreadsheet must contain column headers

## File Structure

The main components used by this feature:

- `/components/excel/file-uploader.tsx`: Handles file upload
- `/components/excel/data-preview.tsx`: Data preview table
- `/components/excel/column-manager.tsx`: Column selection and ordering
- `/components/excel/excel-preview.tsx`: Final text editing
- `/lib/knowledge/browser/excelParser.ts`: Excel parsing logic
- `/lib/knowledge/browser/jsonFormatter.ts`: Formatting utilities

## Troubleshooting

- If you encounter module not found errors, make sure the xlsx package is installed with `--legacy-peer-deps`
- For large files that seem to freeze, try reducing the number of columns in the Configure step
