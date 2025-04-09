# Knowledge Upload Feature Documentation

This document describes the Knowledge Upload feature in WIZZO, which allows users to add various types of content to their knowledge base for AI to reference during chats.

## Overview

The Knowledge Upload feature provides multiple ways to add information to your AI knowledge base:

- **URL**: Add content from web pages
- **Text & Documents**: Directly input text or upload documents (.pdf, .txt, .md, .doc, .docx)
- **Audio**: Upload audio files for transcription
- **Excel**: Process tabular data from Excel spreadsheets (.xlsx, .xls)

## Usage Instructions

### Basic Knowledge Upload

1. Click the "Add Document" button on the Knowledge page
2. Select the appropriate tab for your content type
3. Fill in the required fields (title, description, and content)
4. Click the submit button to add the document to your knowledge base

### Excel Data Processing

The Excel upload feature allows for detailed processing of tabular data with these steps:

#### 1. Upload

- Drag and drop an Excel file or click "Browse Files"
- The file will be automatically processed

#### 2. Preview

- Review the data in a paginated table view
- Use the search function to find specific content
- Navigate between pages for large datasets

#### 3. Configure

- Select which columns to include in the output
- Rearrange column order using drag and drop
- Remove unnecessary columns
- Use "Select All" or "Deselect All" for bulk actions

#### 4. Edit Text

- View and edit the formatted text representation of your data
- Switch between Text and JSON views
- Make manual edits to the content before adding it to your knowledge base
- Use the Copy button to copy the content to your clipboard

## Best Practices

- **Descriptive Titles**: Use clear, descriptive titles that will help you quickly identify documents later
- **Provide Context**: Add helpful descriptions to provide context about the document
- **Clean Data**: For Excel uploads, configure columns to include only relevant data
- **Review Content**: Always review the final text before submission, especially for Excel and URL content

## Technical Implementation

The Knowledge Upload feature uses the following components:

- **Main Controller**: `knowledge-upload.tsx` handles the upload workflow and content type selection
- **Excel Processing**: Components in the `excel` directory handle specialized Excel processing:
  - `file-uploader.tsx`: Provides drag-and-drop and file selection functionality
  - `data-preview.tsx`: Displays tabular data with pagination and search
  - `column-manager.tsx`: Manages column selection and reordering
  - `excel-preview.tsx`: Handles text/JSON editing and formatting

### API Endpoints

Content is submitted to the `/api/knowledge-new` endpoint, which processes different content types:

- `sourceType: 'url'`: Web page content
- `sourceType: 'text'`: Plain text content (including processed Excel)
- `sourceType: 'audio'`: Audio files for transcription

### Data Flow

1. User selects content type and provides data
2. Data is processed (parsed for Excel, extracted for documents)
3. Data is formatted into the appropriate structure
4. Content is submitted to the API endpoint
5. Document is added to the knowledge base and becomes available for AI to reference

## Troubleshooting

- **File Format Issues**: Ensure Excel files are in .xlsx or .xls format
- **Large Files**: For very large Excel files, the processing may take a moment
- **Text Formatting**: If the text formatting isn't ideal, use the Edit Text view to make adjustments before submission

---

For more information or support, contact the development team or refer to the main project documentation.
